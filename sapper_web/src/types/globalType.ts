export interface Variable {
    type: string;
    data: string;
}

export interface GlobalState {
    theme: string;
    language: string;
    notifications: Array<Notification>;
    selectedVariable: Variable;
    isVariableShow: boolean;
    generating: boolean;
}