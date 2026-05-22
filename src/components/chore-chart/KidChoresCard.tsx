import type { AssignedChore } from "@/types/chore";
import type { Kid } from "@/types/kids";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
type MissedChore = {
    id: string;
    title: string;
    assignedKidName: string;
    assignedKidId: string;
    dueDate: string;
};

type Props = {
    selectedKid?: Kid;
    selectedDate: string;
    progress: number;
    todaysChores: AssignedChore[];
    completed: string[];
    toggleChore: (id: string) => void;
    allowanceEligible: boolean;
    missedChores: MissedChore[];
};

export function KidChoresCard({
    selectedKid,
    selectedDate,
    progress,
    todaysChores,
    completed,
    toggleChore,
    allowanceEligible,
    missedChores
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                    <span>
                        {selectedKid?.name ?? "No kid selected"}'s chores for {selectedDate}
                    </span>

                    <Badge>{progress}% done</Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <Progress value={progress} />

                {todaysChores.length === 0 ? (
                    <p className="text-muted-foreground">No chores assigned.</p>
                ) : (
                    todaysChores.map((chore) => {
                        const isDone = completed.includes(chore.id);

                        return (
                            <div
                                key={`${selectedDate}-${chore.id}-${chore.assignedKidId}`}
                                className="flex items-center justify-between rounded-xl border bg-background p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={isDone}
                                        onCheckedChange={() => toggleChore(chore.id)}
                                    />

                                    <span
                                        className={
                                            isDone
                                                ? "text-muted-foreground line-through"
                                                : "font-medium"
                                        }
                                    >
                                        {chore.title}
                                    </span>
                                </div>

                                {isDone && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            </div>
                        );
                    })
                )}
                <div
                    className={`rounded-xl border p-3 ${allowanceEligible
                        ? "border-green-500/40 bg-green-500/10"
                        : "border-red-500/40 bg-red-500/10"
                        }`}
                >
                    <p
                        className={`font-semibold ${allowanceEligible ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {allowanceEligible
                            ? "Allowance Eligible"
                            : "Allowance Not Eligible"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {allowanceEligible
                            ? "All chores for the week are completed."
                            : "There are missed chores for this week."}
                    </p>
                </div>
                {missedChores.length > 0 && (
                    <div className="space-y-2 rounded-xl border bg-background p-3">
                        <p className="font-semibold">Missed chores this week</p>

                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {missedChores.map((chore) => (
                                <li key={`${chore.dueDate}-${chore.id}`}>
                                    {chore.title} · Due {chore.dueDate}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}