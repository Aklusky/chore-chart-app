export type ChoreDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday";

export type ChoreFrequency =
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "misc";

export type Chore = {
    id: string;
    title: string;
    rotationOffset: number;
    frequency: ChoreFrequency;
    scheduledDay?: ChoreDay;
};

export type AssignedChore = Chore & {
    assignedKidId: string;
};