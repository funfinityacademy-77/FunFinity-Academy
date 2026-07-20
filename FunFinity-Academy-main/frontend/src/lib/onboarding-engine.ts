import { OnboardingConfig, OnboardingState, OnboardingStep } from './onboarding-types';

/**
 * Onboarding Engine
 * Handles logic for dynamic step transitions, branching, and state persistence.
 */
export class OnboardingEngine {
  private config: OnboardingConfig;
  private state: OnboardingState;

  constructor(config: OnboardingConfig, initialState?: OnboardingState) {
    this.config = config;
    this.state = initialState || {
      currentStepId: config.steps[0].id,
      completedSteps: [],
      data: {},
      isFinished: false,
    };
  }

  public getState(): OnboardingState {
    return { ...this.state };
  }

  public getCurrentStep(): OnboardingStep {
    return this.config.steps.find(s => s.id === this.state.currentStepId) || this.config.steps[0];
  }

  public updateData(fieldId: string, value: any) {
    this.state.data = { ...this.state.data, [fieldId]: value };
    this.persist();
  }

  public nextStep(): string | null {
    const currentIndex = this.config.steps.findIndex(s => s.id === this.state.currentStepId);
    
    // Check for custom nextStepId in logic
    const currentStep = this.getCurrentStep();
    if (currentStep.logic?.nextStepId) {
      this.state.currentStepId = currentStep.logic.nextStepId;
    } else {
      // Find next visible step based on conditional logic
      let nextIndex = currentIndex + 1;
      while (nextIndex < this.config.steps.length) {
        const potentialNext = this.config.steps[nextIndex];
        if (this.shouldShowStep(potentialNext)) {
          this.state.currentStepId = potentialNext.id;
          break;
        }
        nextIndex++;
      }

      if (nextIndex >= this.config.steps.length) {
        this.state.isFinished = true;
        this.persist();
        return null;
      }
    }

    if (!this.state.completedSteps.includes(currentStep.id)) {
      this.state.completedSteps.push(currentStep.id);
    }

    this.persist();
    return this.state.currentStepId;
  }

  public prevStep(): string | null {
    const currentIndex = this.config.steps.findIndex(s => s.id === this.state.currentStepId);
    if (currentIndex <= 0) return null;

    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
      const potentialPrev = this.config.steps[prevIndex];
      if (this.shouldShowStep(potentialPrev)) {
        this.state.currentStepId = potentialPrev.id;
        break;
      }
      prevIndex--;
    }

    this.persist();
    return this.state.currentStepId;
  }

  private shouldShowStep(step: OnboardingStep): boolean {
    if (!step.logic?.showIf) return true;

    const { fieldId, operator, value } = step.logic.showIf;
    const actualValue = this.state.data[fieldId];

    switch (operator) {
      case 'equals': return actualValue === value;
      case 'contains': return Array.isArray(actualValue) && actualValue.includes(value);
      case 'exists': return actualValue !== undefined && actualValue !== null;
      default: return true;
    }
  }

  private persist() {
    localStorage.setItem(`onboarding_${this.config.id}`, JSON.stringify(this.state));
    // In real app: call syncToBackend(this.state)
  }

  public static loadFromStorage(config: OnboardingConfig): OnboardingState | null {
    const stored = localStorage.getItem(`onboarding_${config.id}`);
    return stored ? JSON.parse(stored) : null;
  }
}
