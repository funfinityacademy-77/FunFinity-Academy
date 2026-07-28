// LaTeX Rendering Engine for FunFinity Academy
// Backend-to-frontend pipeline for complex ODEs and physics formulas
// Textbook-level precision with KaTeX/MathJax integration

import { dbService } from './database-service';

// LaTeX rendering configuration
interface LatexConfig {
  engine: 'katex' | 'mathjax'; // Rendering engine
  delimiters: {
    inline: [string, string]; // e.g., ['$', '$']
    display: [string, string]; // e.g., ['\\[', '\\]']
  };
  options: {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
    colorIsTextColor?: boolean;
    strict?: boolean | 'warn' | 'ignore';
    trust?: boolean;
  };
}

// Physics formula templates
interface PhysicsFormula {
  id: string;
  name: string;
  category: 'mechanics' | 'thermodynamics' | 'electromagnetism' | 'waves' | 'optics' | 'modern';
  latex: string;
  description: string;
  variables: Array<{
    symbol: string;
    name: string;
    unit: string;
    description: string;
  }>;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

// Mathematical formula templates
interface MathFormula {
  id: string;
  name: string;
  category: 'algebra' | 'trigonometry' | 'calculus' | 'differential_equations' | 'linear_algebra';
  latex: string;
  description: string;
  variables: Array<{
    symbol: string;
    name: string;
    description: string;
  }>;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

// LaTeX rendering service class
export class LatexRenderingService {
  private static instance: LatexRenderingService;
  private config: LatexConfig;
  private isClient: boolean;
  private katexLoaded: boolean = false;
  private mathJaxLoaded: boolean = false;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
    this.config = {
      engine: 'katex', // Default to KaTeX for performance
      delimiters: {
        inline: ['$', '$'],
        display: ['\\[', '\\]'],
      },
      options: {
        displayMode: false,
        throwOnError: false,
        errorColor: '#cc0000',
        colorIsTextColor: true,
        strict: false,
        trust: true,
      },
    };
  }

  // Singleton pattern
  public static getInstance(): LatexRenderingService {
    if (!LatexRenderingService.instance) {
      LatexRenderingService.instance = new LatexRenderingService();
    }
    return LatexRenderingService.instance;
  }

  // Initialize LaTeX rendering engine
  async initialize(): Promise<void> {
    if (!this.isClient) return;

    if (this.config.engine === 'katex') {
      await this.loadKaTeX();
    } else {
      await this.loadMathJax();
    }
  }

  // Load KaTeX library
  private async loadKaTeX(): Promise<void> {
    if (this.katexLoaded) return;

    return new Promise((resolve, reject) => {
      // Load KaTeX CSS
      const katexCSS = document.createElement('link');
      katexCSS.rel = 'stylesheet';
      katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(katexCSS);

      // Load KaTeX JS
      const katexJS = document.createElement('script');
      katexJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      katexJS.onload = () => {
        this.katexLoaded = true;
        resolve();
      };
      katexJS.onerror = () => reject(new Error('Failed to load KaTeX'));
      document.head.appendChild(katexJS);
    });
  }

  // Load MathJax library
  private async loadMathJax(): Promise<void> {
    if (this.mathJaxLoaded) return;

    return new Promise((resolve, reject) => {
      // Load MathJax configuration
      const mathJaxConfig = document.createElement('script');
      mathJaxConfig.textContent = `
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
          },
          startup: {
            typeset: false
          }
        };
      `;
      document.head.appendChild(mathJaxConfig);

      // Load MathJax JS
      const mathJaxJS = document.createElement('script');
      mathJaxJS.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      mathJaxJS.onload = () => {
        this.mathJaxLoaded = true;
        resolve();
      };
      mathJaxJS.onerror = () => reject(new Error('Failed to load MathJax'));
      document.head.appendChild(mathJaxJS);
    });
  }

  // Render LaTeX string to HTML
  renderLatex(latex: string, displayMode: boolean = false): string {
    if (!this.isClient) {
      // Server-side rendering - return escaped LaTeX
      return this.escapeLatex(latex);
    }

    try {
      if (this.config.engine === 'katex' && this.katexLoaded) {
        return this.renderWithKaTeX(latex, displayMode);
      } else if (this.config.engine === 'mathjax' && this.mathJaxLoaded) {
        return this.renderWithMathJax(latex, displayMode);
      } else {
        // Fallback to escaped LaTeX
        return this.escapeLatex(latex);
      }
    } catch (error) {
      console.error('Mathematical expression formatting encountered an issue. Showing plain text instead.');
      return this.escapeLatex(latex);
    }
  }

  // Render with KaTeX
  private renderWithKaTeX(latex: string, displayMode: boolean): string {
    const katex = (window as any).katex;
    if (!katex) return this.escapeLatex(latex);

    try {
      const html = katex.renderToString(latex, {
        ...this.config.options,
        displayMode,
      });
      return html;
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return this.escapeLatex(latex);
    }
  }

  // Render with MathJax
  private renderWithMathJax(latex: string, displayMode: boolean): string {
    const mathJax = (window as any).MathJax;
    if (!mathJax) return this.escapeLatex(latex);

    try {
      // Create a temporary element for MathJax processing
      const tempDiv = document.createElement('div');
      // Sanitize LaTeX input to prevent XSS
      const sanitizedLatex = latex
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
      
      tempDiv.textContent = displayMode ? `\\[${sanitizedLatex}\\]` : `$${sanitizedLatex}$`;
      document.body.appendChild(tempDiv);

      // Process with MathJax
      mathJax.typesetPromise([tempDiv]).then(() => {
        // MathJax has processed the content
        document.body.removeChild(tempDiv);
      }).catch((error: any) => {
        console.error('MathJax rendering error:', error);
        document.body.removeChild(tempDiv);
      });

      // Return the processed content
      return tempDiv.innerHTML;
    } catch (error) {
      console.error('MathJax rendering error:', error);
      return this.escapeLatex(latex);
    }
  }

  // Escape LaTeX for fallback rendering
  private escapeLatex(latex: string): string {
    // Sanitize LaTeX input to prevent XSS
    const sanitizedLatex = latex
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
    return `<code class="latex-fallback">${sanitizedLatex}</code>`;
  }

  // Process content with LaTeX delimiters
  processContent(content: string): string {
    if (!content) return content;

    // Find and replace LaTeX delimiters
    const { inline, display } = this.config.delimiters;
    
    // Process display math first
    let processed = content;
    const displayRegex = new RegExp(
      `${this.escapeRegex(display[0])}([\\s\\S]*?)${this.escapeRegex(display[1])}`,
      'g'
    );
    
    processed = processed.replace(displayRegex, (match, latex) => {
      return this.renderLatex(latex.trim(), true);
    });

    // Process inline math
    const inlineRegex = new RegExp(
      `${this.escapeRegex(inline[0])}([\\s\\S]*?)${this.escapeRegex(inline[1])}`,
      'g'
    );
    
    processed = processed.replace(inlineRegex, (match, latex) => {
      return this.renderLatex(latex.trim(), false);
    });

    return processed;
  }

  // Escape regex special characters
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Get physics formula templates
  async getPhysicsFormulas(category?: string): Promise<PhysicsFormula[]> {
    const formulas = this.getPhysicsFormulaTemplates();
    return category ? formulas.filter(f => f.category === category) : formulas;
  }

  // Get mathematical formula templates
  async getMathFormulas(category?: string): Promise<MathFormula[]> {
    const formulas = this.getMathFormulaTemplates();
    return category ? formulas.filter(f => f.category === category) : formulas;
  }

  // Physics formula templates
  private getPhysicsFormulaTemplates(): PhysicsFormula[] {
    return [
      // Mechanics
      {
        id: 'newton-second-law',
        name: 'Newton\'s Second Law',
        category: 'mechanics',
        latex: '\\vec{F} = m\\vec{a}',
        description: 'Force equals mass times acceleration',
        variables: [
          { symbol: 'F', name: 'Force', unit: 'N', description: 'Net force acting on object' },
          { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object' },
          { symbol: 'a', name: 'Acceleration', unit: 'm/s²', description: 'Acceleration of the object' },
        ],
        difficulty: 'basic',
      },
      {
        id: 'kinematic-equation',
        name: 'Kinematic Equation',
        category: 'mechanics',
        latex: 'v^2 = v_0^2 + 2a\\Delta x',
        description: 'Final velocity squared equals initial velocity squared plus 2 times acceleration times displacement',
        variables: [
          { symbol: 'v', name: 'Final Velocity', unit: 'm/s', description: 'Final velocity' },
          { symbol: 'v₀', name: 'Initial Velocity', unit: 'm/s', description: 'Initial velocity' },
          { symbol: 'a', name: 'Acceleration', unit: 'm/s²', description: 'Constant acceleration' },
          { symbol: 'Δx', name: 'Displacement', unit: 'm', description: 'Change in position' },
        ],
        difficulty: 'basic',
      },
      {
        id: 'momentum',
        name: 'Linear Momentum',
        category: 'mechanics',
        latex: '\\vec{p} = m\\vec{v}',
        description: 'Linear momentum equals mass times velocity',
        variables: [
          { symbol: 'p', name: 'Momentum', unit: 'kg·m/s', description: 'Linear momentum' },
          { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object' },
          { symbol: 'v', name: 'Velocity', unit: 'm/s', description: 'Velocity of the object' },
        ],
        difficulty: 'basic',
      },
      {
        id: 'work-energy-theorem',
        name: 'Work-Energy Theorem',
        category: 'mechanics',
        latex: 'W = \\Delta K = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2',
        description: 'Work done equals change in kinetic energy',
        variables: [
          { symbol: 'W', name: 'Work', unit: 'J', description: 'Work done on the object' },
          { symbol: 'K', name: 'Kinetic Energy', unit: 'J', description: 'Kinetic energy' },
          { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object' },
          { symbol: 'v_f', name: 'Final Velocity', unit: 'm/s', description: 'Final velocity' },
          { symbol: 'v_i', name: 'Initial Velocity', unit: 'm/s', description: 'Initial velocity' },
        ],
        difficulty: 'intermediate',
      },
      // Waves
      {
        id: 'wave-equation',
        name: 'Wave Equation',
        category: 'waves',
        latex: 'v = f\\lambda',
        description: 'Wave velocity equals frequency times wavelength',
        variables: [
          { symbol: 'v', name: 'Wave Velocity', unit: 'm/s', description: 'Speed of the wave' },
          { symbol: 'f', name: 'Frequency', unit: 'Hz', description: 'Frequency of the wave' },
          { symbol: 'λ', name: 'Wavelength', unit: 'm', description: 'Wavelength of the wave' },
        ],
        difficulty: 'basic',
      },
      // Electromagnetism
      {
        id: 'coulombs-law',
        name: 'Coulomb\'s Law',
        category: 'electromagnetism',
        latex: 'F = k\\frac{q_1q_2}{r^2}',
        description: 'Electrostatic force between two point charges',
        variables: [
          { symbol: 'F', name: 'Force', unit: 'N', description: 'Electrostatic force' },
          { symbol: 'k', name: 'Coulomb Constant', unit: 'N·m²/C²', description: 'Coulomb\'s constant' },
          { symbol: 'q₁', name: 'Charge 1', unit: 'C', description: 'First point charge' },
          { symbol: 'q₂', name: 'Charge 2', unit: 'C', description: 'Second point charge' },
          { symbol: 'r', name: 'Distance', unit: 'm', description: 'Distance between charges' },
        ],
        difficulty: 'intermediate',
      },
    ];
  }

  // Math formula templates
  private getMathFormulaTemplates(): MathFormula[] {
    return [
      // Algebra
      {
        id: 'quadratic-formula',
        name: 'Quadratic Formula',
        category: 'algebra',
        latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        description: 'Solution to quadratic equation ax² + bx + c = 0',
        variables: [
          { symbol: 'x', name: 'Variable', description: 'Unknown variable' },
          { symbol: 'a', name: 'Coefficient', description: 'Quadratic coefficient' },
          { symbol: 'b', name: 'Coefficient', description: 'Linear coefficient' },
          { symbol: 'c', name: 'Constant', description: 'Constant term' },
        ],
        difficulty: 'intermediate',
      },
      // Trigonometry
      {
        id: 'pythagorean-identity',
        name: 'Pythagorean Identity',
        category: 'trigonometry',
        latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
        description: 'Fundamental trigonometric identity',
        variables: [
          { symbol: 'θ', name: 'Angle', description: 'Angle in radians' },
          { symbol: 'sin', name: 'Sine', description: 'Sine function' },
          { symbol: 'cos', name: 'Cosine', description: 'Cosine function' },
        ],
        difficulty: 'basic',
      },
      // Calculus
      {
        id: 'derivative-definition',
        name: 'Derivative Definition',
        category: 'calculus',
        latex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
        description: 'Definition of derivative as limit of difference quotient',
        variables: [
          { symbol: 'f\'(x)', name: 'Derivative', description: 'Derivative of f at x' },
          { symbol: 'h', name: 'Increment', description: 'Small change in x' },
          { symbol: 'lim', name: 'Limit', description: 'Limit as h approaches 0' },
        ],
        difficulty: 'intermediate',
      },
      {
        id: 'integral-definition',
        name: 'Definite Integral',
        category: 'calculus',
        latex: '\\int_a^b f(x)dx = F(b) - F(a)',
        description: 'Fundamental theorem of calculus',
        variables: [
          { symbol: '∫', name: 'Integral', description: 'Integral symbol' },
          { symbol: 'f(x)', name: 'Function', description: 'Integrand function' },
          { symbol: 'F(x)', name: 'Antiderivative', description: 'Antiderivative of f' },
          { symbol: 'a, b', name: 'Limits', description: 'Lower and upper limits' },
        ],
        difficulty: 'intermediate',
      },
      // Differential Equations
      {
        id: 'first-order-ode',
        name: 'First Order ODE',
        category: 'differential_equations',
        latex: '\\frac{dy}{dx} + P(x)y = Q(x)',
        description: 'General form of first order linear differential equation',
        variables: [
          { symbol: 'dy/dx', name: 'Derivative', description: 'First derivative of y' },
          { symbol: 'P(x)', name: 'Function', description: 'Coefficient function' },
          { symbol: 'Q(x)', name: 'Function', description: 'Non-homogeneous term' },
        ],
        difficulty: 'advanced',
      },
      {
        id: 'second-order-ode',
        name: 'Second Order ODE',
        category: 'differential_equations',
        latex: '\\frac{d^2y}{dx^2} + a\\frac{dy}{dx} + by = 0',
        description: 'Homogeneous second order linear differential equation with constant coefficients',
        variables: [
          { symbol: 'd²y/dx²', name: 'Second Derivative', description: 'Second derivative of y' },
          { symbol: 'a, b', name: 'Constants', description: 'Constant coefficients' },
        ],
        difficulty: 'advanced',
      },
    ];
  }

  // Render lesson content with LaTeX
  async renderLessonContent(lessonContent: string): Promise<string> {
    if (!lessonContent) return lessonContent;

    // Process LaTeX delimiters in the content
    return this.processContent(lessonContent);
  }

  // Render problem set with LaTeX
  async renderProblemSet(problems: any[]): Promise<any[]> {
    return problems.map(problem => ({
      ...problem,
      question: this.processContent(problem.question || ''),
      solution: this.processContent(problem.solution || ''),
      explanation: this.processContent(problem.explanation || ''),
    }));
  }

  // Validate LaTeX syntax
  validateLatex(latex: string): { isValid: boolean; error?: string } {
    try {
      if (this.config.engine === 'katex' && this.katexLoaded) {
        const katex = (window as any).katex;
        katex.parse(latex, this.config.options);
        return { isValid: true };
      }
      return { isValid: true }; // Assume valid if engine not loaded
    } catch (error) {
      return {
        isValid: false,
        error: (error as Error).message,
      };
    }
  }

  // Convert LaTeX to plain text (for accessibility)
  latexToPlainText(latex: string): string {
    return latex
      .replace(/\\[a-zA-Z]+\{/g, '') // Remove command starts
      .replace(/\}/g, '') // Remove command ends
      .replace(/[{}]/g, '') // Remove braces
      .replace(/\\[a-zA-Z]+/g, '') // Remove standalone commands
      .replace(/[_^]/g, '') // Remove sub/superscript markers
      .trim();
  }

  // Get rendering statistics
  getRenderingStats(): {
    engine: string;
    isLoaded: boolean;
    supportedCommands: string[];
  } {
    return {
      engine: this.config.engine,
      isLoaded: this.config.engine === 'katex' ? this.katexLoaded : this.mathJaxLoaded,
      supportedCommands: [
        '\\frac', '\\sqrt', '\\sum', '\\int', '\\partial', '\\nabla',
        '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta', '\\lambda',
        '\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\exp',
        '\\vec', '\\hat', '\\bar', '\\dot', '\\ddot',
      ],
    };
  }
}

// Export singleton instance
export const latexService = LatexRenderingService.getInstance();

// Export types
export type { LatexConfig, PhysicsFormula, MathFormula };
