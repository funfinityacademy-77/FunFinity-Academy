// Email Automation Service
// This service handles email automation for the FunFinity Academy ecosystem

import { CONTACT_EMAIL } from "@/config/constants";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailTrigger {
  id: string;
  name: string;
  description: string;
  templateId: string;
  conditions: TriggerCondition[];
  enabled: boolean;
}

export interface TriggerCondition {
  type: 'progress' | 'streak' | 'badge' | 'time' | 'activity' | 'milestone';
  value?: number | string;
  operator?: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface EmailLog {
  id: string;
  recipient: string;
  templateId: string;
  triggerId: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

// Email Templates
const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    subject: 'Welcome to FunFinity Academy! 🎉',
    body: `Hi {{name}},

Welcome to FunFinity Academy! We're excited to have you on board.

Your journey to learning excellence starts now. Here's what you can expect:
- Personalized learning paths
- Interactive quizzes and assessments
- Progress tracking and gamification
- AI-powered study assistance

Get started by completing your Learning DNA assessment to personalize your experience.

Best regards,
The FunFinity Academy Team`,
    variables: ['name']
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    subject: 'New Bug Report: {{title}}',
    body: `Admin Notification - New Bug Report Submitted

Title: {{title}}
Description: {{description}}
Steps to Reproduce: {{steps}}
Severity: {{severity}}
Category: {{category}}
Submitted by Email: {{email}}
Type: {{type}}

Please review this bug report and take appropriate action.

Best regards,
FunFinity Academy System`,
    variables: ['title', 'description', 'steps', 'severity', 'category', 'email', 'type']
  },
  {
    id: 'feature-request',
    name: 'Feature Request',
    subject: 'New Feature Request: {{title}}',
    body: `Admin Notification - New Feature Request Submitted

Title: {{title}}
Description: {{description}}
Use Case: {{useCase}}
Priority: {{priority}}
Category: {{category}}
Submitted by Email: {{email}}
Type: {{type}}

Please review this feature request and consider it for implementation.

Best regards,
FunFinity Academy System`,
    variables: ['title', 'description', 'useCase', 'priority', 'category', 'email', 'type']
  },
  {
    id: 'general-feedback',
    name: 'General Feedback',
    subject: 'New Feedback: {{subject}}',
    body: `Admin Notification - New Feedback Submitted

Type: {{type}}
Subject: {{subject}}
Message: {{message}}
Rating: {{rating}}
Submitted by Email: {{email}}
Feedback Type: {{feedbackType}}

Please review this feedback and take appropriate action.

Best regards,
FunFinity Academy System`,
    variables: ['type', 'subject', 'message', 'rating', 'email', 'feedbackType']
  },
  {
    id: 'support-request',
    name: 'Support Request',
    subject: 'New Support Request: {{subject}}',
    body: `Admin Notification - New Support Request Submitted

Category: {{category}}
Subject: {{subject}}
Description: {{description}}
Urgency: {{urgency}}
Email: {{email}}
Phone: {{phone}}
Type: {{type}}

Please review this support request and respond to the user promptly.

Best regards,
FunFinity Academy System`,
    variables: ['category', 'subject', 'description', 'urgency', 'email', 'phone', 'type']
  },
  {
    id: 'progress-milestone',
    name: 'Progress Milestone',
    subject: 'You reached {{milestone}}% progress! 🚀',
    body: `Hi {{name}},

Congratulations! You've reached {{milestone}}% progress in {{course}}.

Keep up the great work! You're making excellent progress toward your learning goals.

Your current stats:
- Courses completed: {{coursesCompleted}}
- Total study time: {{studyTime}}
- Current streak: {{streak}} days

Keep learning and growing!

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'milestone', 'course', 'coursesCompleted', 'studyTime', 'streak']
  },
  {
    id: 'streak-achievement',
    name: 'Streak Achievement',
    subject: '{{streak}} day streak! 🔥',
    body: `Hi {{name},

Amazing! You've maintained a {{streak}}-day learning streak!

Consistency is key to success. Your dedication is truly impressive.

Keep the momentum going!

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'streak']
  },
  {
    id: 'badge-earned',
    name: 'Badge Earned',
    subject: 'You earned the {{badgeName}} badge! 🏆',
    body: `Hi {{name},

Congratulations! You've earned the {{badgeName}} badge!

{{badgeDescription}}

Your achievement has been added to your profile. Keep up the excellent work!

View all your badges: {{badgesUrl}}

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'badgeName', 'badgeDescription', 'badgesUrl']
  },
  {
    id: 'course-completion',
    name: 'Course Completion',
    subject: 'You completed {{course}}! 🎓',
    body: `Hi {{name},

Congratulations! You've successfully completed the course: {{course}}

Here's your achievement summary:
- Final score: {{score}}%
- Time spent: {{timeSpent}}
- Quizzes passed: {{quizzesPassed}}
- Badges earned: {{badgesEarned}}

You can now download your certificate from your profile.

Ready for your next challenge? Check out our recommended courses.

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'course', 'score', 'timeSpent', 'quizzesPassed', 'badgesEarned']
  },
  {
    id: 'weekly-progress',
    name: 'Weekly Progress Report',
    subject: 'Your weekly progress report 📊',
    body: `Hi {{name}},

Here's your learning progress for this week:

📈 Progress Summary:
- Courses viewed: {{coursesViewed}}
- Quizzes completed: {{quizzesCompleted}}
- Study time: {{studyTime}}
- Points earned: {{pointsEarned}}
- Current streak: {{streak}} days

🏆 Achievements:
{{achievements}}

💡 Recommendations:
{{recommendations}}

Keep up the great work!

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'coursesViewed', 'quizzesCompleted', 'studyTime', 'pointsEarned', 'streak', 'achievements', 'recommendations']
  },
  {
    id: 'inactivity-reminder',
    name: 'Inactivity Reminder',
    subject: 'We miss you! Come back to learning 📚',
    body: `Hi {{name},

It's been a while since we've seen you on FunFinity Academy.

Your learning journey is waiting! Here's what you missed:
- New courses available: {{newCourses}}
- Community discussions: {{discussions}}
- Your current streak: {{streak}} days

Log in now to continue your progress and maintain your streak.

We're here to support your learning journey every step of the way.

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'newCourses', 'discussions', 'streak']
  },
  {
    id: 'level-up',
    name: 'Level Up',
    subject: 'You reached level {{level}}! ⭐',
    body: `Hi {{name},

Congratulations! You've reached level {{level}}!

Your dedication to learning has paid off. Here's what you've achieved:
- Total XP: {{totalXP}}
- Badges earned: {{badgesEarned}}
- Courses completed: {{coursesCompleted}}

Keep leveling up and unlocking new achievements!

Best regards,
The FunFinity Academy Team`,
    variables: ['name', 'level', 'totalXP', 'badgesEarned', 'coursesCompleted']
  },
];

// Email Triggers
const emailTriggers: EmailTrigger[] = [
  {
    id: 'welcome-trigger',
    name: 'New User Welcome',
    description: 'Send welcome email when a new user signs up',
    templateId: 'welcome-email',
    conditions: [
      { type: 'activity', value: 'signup' }
    ],
    enabled: true
  },
  {
    id: 'progress-25',
    name: '25% Progress Milestone',
    description: 'Send email when user reaches 25% course progress',
    templateId: 'progress-milestone',
    conditions: [
      { type: 'progress', value: 25, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'progress-50',
    name: '50% Progress Milestone',
    description: 'Send email when user reaches 50% course progress',
    templateId: 'progress-milestone',
    conditions: [
      { type: 'progress', value: 50, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'progress-75',
    name: '75% Progress Milestone',
    description: 'Send email when user reaches 75% course progress',
    templateId: 'progress-milestone',
    conditions: [
      { type: 'progress', value: 75, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'progress-100',
    name: 'Course Completion',
    description: 'Send email when user completes a course',
    templateId: 'course-completion',
    conditions: [
      { type: 'progress', value: 100, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Send email when user achieves 3-day streak',
    templateId: 'streak-achievement',
    conditions: [
      { type: 'streak', value: 3, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Send email when user achieves 7-day streak',
    templateId: 'streak-achievement',
    conditions: [
      { type: 'streak', value: 7, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'streak-30',
    name: '30-Day Streak',
    description: 'Send email when user achieves 30-day streak',
    templateId: 'streak-achievement',
    conditions: [
      { type: 'streak', value: 30, operator: 'equals' }
    ],
    enabled: true
  },
  {
    id: 'badge-earned-trigger',
    name: 'Badge Earned',
    description: 'Send email when user earns a badge',
    templateId: 'badge-earned',
    conditions: [
      { type: 'badge' }
    ],
    enabled: true
  },
  {
    id: 'level-up-trigger',
    name: 'Level Up',
    description: 'Send email when user levels up',
    templateId: 'level-up',
    conditions: [
      { type: 'milestone', value: 'level_up' }
    ],
    enabled: true
  },
  {
    id: 'weekly-report',
    name: 'Weekly Progress Report',
    description: 'Send weekly progress report every Sunday',
    templateId: 'weekly-progress',
    conditions: [
      { type: 'time', value: 'weekly' }
    ],
    enabled: true
  },
  {
    id: 'inactivity-7-days',
    name: '7-Day Inactivity',
    description: 'Send reminder after 7 days of inactivity',
    templateId: 'inactivity-reminder',
    conditions: [
      { type: 'activity', value: 'inactive', operator: 'greater_than' }
    ],
    enabled: true
  },
  {
    id: 'inactivity-14-days',
    name: '14-Day Inactivity',
    description: 'Send reminder after 14 days of inactivity',
    templateId: 'inactivity-reminder',
    conditions: [
      { type: 'activity', value: 'inactive', operator: 'greater_than' }
    ],
    enabled: true
  },
];

class EmailAutomationService {
  private static instance: EmailAutomationService;
  private emailLogs: EmailLog[] = [];
  private readonly senderEmail = CONTACT_EMAIL;
  private readonly adminEmails = [CONTACT_EMAIL];

  private constructor() {
    this.loadEmailLogs();
  }

  static getInstance(): EmailAutomationService {
    if (!EmailAutomationService.instance) {
      EmailAutomationService.instance = new EmailAutomationService();
    }
    return EmailAutomationService.instance;
  }

  private loadEmailLogs() {
    try {
      const saved = localStorage.getItem('email_logs');
      if (saved) {
        this.emailLogs = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
    }
  }

  private saveEmailLogs() {
    try {
      localStorage.setItem('email_logs', JSON.stringify(this.emailLogs));
    } catch (error) {
      console.error('Error saving email logs:', error);
    }
  }

  getTemplates(): EmailTemplate[] {
    return emailTemplates;
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return emailTemplates.find(t => t.id === id);
  }

  getTriggers(): EmailTrigger[] {
    return emailTriggers;
  }

  getTrigger(id: string): EmailTrigger | undefined {
    return emailTriggers.find(t => t.id === id);
  }

  getEmailLogs(): EmailLog[] {
    return this.emailLogs;
  }

  private renderTemplate(template: EmailTemplate, variables: Record<string, string>): string {
    let body = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return body;
  }

  async sendEmail(
    recipient: string,
    templateId: string,
    variables: Record<string, string>,
    triggerId?: string
  ): Promise<boolean> {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    const emailLog: EmailLog = {
      id: `email-${Date.now()}`,
      recipient,
      templateId,
      triggerId: triggerId || 'manual',
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the email sending
      const subject = this.renderTemplate(template, variables);
      const body = this.renderTemplate(template, variables);

      console.log('Email would be sent:', {
        from: this.senderEmail,
        to: recipient,
        subject: template.subject,
        body,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      emailLog.status = 'sent';
      this.emailLogs.push(emailLog);
      this.saveEmailLogs();

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      emailLog.status = 'failed';
      emailLog.error = error instanceof Error ? error.message : 'Unknown error';
      this.emailLogs.push(emailLog);
      this.saveEmailLogs();
      return false;
    }
  }

  async checkTriggers(userData: {
    userId: string;
    email: string;
    name: string;
    progress?: number;
    streak?: number;
    course?: string;
    lastActivity?: string;
    badges?: string[];
    level?: number;
  }): Promise<void> {
    const enabledTriggers = this.getTriggers().filter(t => t.enabled);

    for (const trigger of enabledTriggers) {
      const shouldTrigger = this.evaluateTrigger(trigger, userData);
      
      if (shouldTrigger) {
        const variables = this.buildVariables(trigger.templateId, userData);
        await this.sendEmail(userData.email, trigger.templateId, variables, trigger.id);
      }
    }
  }

  private evaluateTrigger(trigger: EmailTrigger, userData: any): boolean {
    for (const condition of trigger.conditions) {
      switch (condition.type) {
        case 'progress':
          if (condition.value !== undefined && userData.progress !== undefined) {
            if (condition.operator === 'equals') {
              return userData.progress === condition.value;
            } else if (condition.operator === 'greater_than') {
              return userData.progress > condition.value;
            }
          }
          break;
        case 'streak':
          if (condition.value !== undefined && userData.streak !== undefined) {
            if (condition.operator === 'equals') {
              return userData.streak === condition.value;
            } else if (condition.operator === 'greater_than') {
              return userData.streak >= condition.value;
            }
          }
          break;
        case 'badge':
          if (userData.badges && userData.badges.length > 0) {
            return true;
          }
          break;
        case 'milestone':
          if (condition.value === 'level_up' && userData.level) {
            return true;
          }
          break;
        case 'activity':
          if (condition.value === 'signup') {
            return true;
          }
          if (condition.value === 'inactive' && userData.lastActivity) {
            const lastActivity = new Date(userData.lastActivity);
            const daysInactive = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            return daysInactive > 7;
          }
          break;
      }
    }
    return false;
  }

  private buildVariables(templateId: string, userData: any): Record<string, string> {
    const template = this.getTemplate(templateId);
    if (!template) return {};

    const variables: Record<string, string> = {
      name: userData.name || 'Student',
      email: userData.email || '',
    };

    template.variables.forEach(variable => {
      switch (variable) {
        case 'milestone':
          variables.milestone = String(userData.progress || 0);
          break;
        case 'course':
          variables.course = userData.course || 'your course';
          break;
        case 'streak':
          variables.streak = String(userData.streak || 0);
          break;
        case 'level':
          variables.level = String(userData.level || 1);
          break;
        case 'badgeName':
          variables.badgeName = userData.badges?.[0] || 'New Badge';
          break;
        case 'badgeDescription':
          variables.badgeDescription = 'Congratulations on earning this achievement!';
          break;
        case 'badgesUrl':
          variables.badgesUrl = window.location.origin + '/app/badges';
          break;
        case 'score':
          variables.score = String(userData.score || 100);
          break;
        case 'timeSpent':
          variables.timeSpent = userData.timeSpent || '2 hours';
          break;
        case 'quizzesPassed':
          variables.quizzesPassed = String(userData.quizzesPassed || 5);
          break;
        case 'badgesEarned':
          variables.badgesEarned = String(userData.badges?.length || 1);
          break;
        case 'coursesCompleted':
          variables.coursesCompleted = String(userData.coursesCompleted || 0);
          break;
        case 'totalXP':
          variables.totalXP = String(userData.totalXP || 0);
          break;
        case 'studyTime':
          variables.studyTime = userData.studyTime || '5 hours';
          break;
        case 'pointsEarned':
          variables.pointsEarned = String(userData.pointsEarned || 50);
          break;
        case 'coursesViewed':
          variables.coursesViewed = String(userData.coursesViewed || 3);
          break;
        case 'quizzesCompleted':
          variables.quizzesCompleted = String(userData.quizzesCompleted || 2);
          break;
        case 'achievements':
          variables.achievements = userData.achievements || 'Keep up the great work!';
          break;
        case 'recommendations':
          variables.recommendations = userData.recommendations || 'Continue with your current course';
          break;
        case 'newCourses':
          variables.newCourses = String(userData.newCourses || 5);
          break;
        case 'discussions':
          variables.discussions = String(userData.discussions || 10);
          break;
      }
    });

    return variables;
  }

  clearLogs(): void {
    this.emailLogs = [];
    this.saveEmailLogs();
  }

  async sendToAdmins(
    templateId: string,
    variables: Record<string, string>,
    triggerId?: string
  ): Promise<boolean> {
    const results = await Promise.all(
      this.adminEmails.map(email =>
        this.sendEmail(email, templateId, variables, triggerId)
      )
    );
    return results.every(result => result);
  }

  getAdminEmails(): string[] {
    return this.adminEmails;
  }
}

export const emailAutomationService = EmailAutomationService.getInstance();
