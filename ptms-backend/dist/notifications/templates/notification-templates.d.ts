export interface NotificationTemplate {
    subject: {
        en: string;
        bm: string;
    };
    body: {
        en: string;
        bm: string;
    };
}
export declare const NotificationTemplates: {
    SUBMISSION_RECEIVED: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    CHANGES_REQUESTED: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    APPLICATION_APPROVED: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    SLI03_READY: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    BLI04_DUE_REMINDER: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    OVERDUE_REMINDER: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    COORDINATOR_ESCALATION: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    NEW_SUBMISSION: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    BATCH_SUBMISSIONS: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
    BATCH_ESCALATIONS: {
        subject: {
            en: string;
            bm: string;
        };
        body: {
            en: string;
            bm: string;
        };
    };
};
export declare function renderTemplate(template: NotificationTemplate, language: 'en' | 'bm', variables: Record<string, string>): {
    subject: string;
    body: string;
};
