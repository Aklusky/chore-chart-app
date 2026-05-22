import type { AssignedChore, Chore } from "@/types/chore";
import type { Kid } from "@/types/kids";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    chores: Chore[];
    kids: Kid[];
    selectedDate: string;
    choresWithAssignments: AssignedChore[];
    rotateChore: (choreId: string) => void;
    deleteChore: (choreId: string) => void;
};

export function RotationPreviewCard({
    chores,
    kids,
    selectedDate,
    choresWithAssignments,
    rotateChore,
    deleteChore,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Auto rotation for {selectedDate}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {chores.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No chores added yet.</p>
                ) : kids.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Add kids first so chores can be assigned.
                    </p>
                ) : (
                    choresWithAssignments.map((chore) => {
                        const assignedKid = kids.find(
                            (kid) => kid.id === chore.assignedKidId
                        );

                        return (
                            <div
                                key={`${selectedDate}-${chore.id}`}
                                className="flex flex-col gap-2 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-medium">{chore.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {chore.frequency} · Assigned to:{" "}
                                        {assignedKid?.name ?? "Unassigned"}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => rotateChore(chore.id)}
                                    >
                                        Rotate
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteChore(chore.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}