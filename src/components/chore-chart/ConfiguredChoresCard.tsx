import type { Chore } from "@/types/chore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    chores: Chore[];
    rotateChore: (choreId: string) => void;
    deleteChore: (choreId: string) => void;
};

export function ConfiguredChoresCard({
    chores,
    rotateChore,
    deleteChore,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Chores</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {chores.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No chores added yet.</p>
                ) : (
                    chores.map((chore) => (
                        <div
                            key={chore.id}
                            className="flex items-center justify-between rounded-xl border bg-background p-4"
                        >
                            <div>
                                <p className="font-medium">{chore.title}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {chore.frequency}
                                    {chore.scheduledDay
                                        ? ` • ${chore.scheduledDay}`
                                        : ""}
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
                    ))
                )}
            </CardContent>
        </Card>
    );
}