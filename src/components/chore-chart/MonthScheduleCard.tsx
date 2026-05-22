import type { AssignedChore, Chore } from "@/types/chore";
import type { Kid } from "@/types/kids";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    showMonth: boolean;
    setShowMonth: (value: boolean) => void;
    monthSchedule: { date: string; chores: AssignedChore[] }[];
    monthWarnings: string[];
    kids: Kid[];
    chores: Chore[];
};

export function MonthScheduleCard({
    showMonth,
    setShowMonth,
    monthSchedule = [],
    monthWarnings = [],
    kids,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                    Month Schedule
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMonth(!showMonth)}
                    >
                        {showMonth ? "Hide Month" : "Show Whole Month"}
                    </Button>
                </CardTitle>
            </CardHeader>

            {showMonth && (
                <CardContent className="space-y-4">
                    {monthWarnings.length > 0 && (
                        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm">
                            <p className="mb-2 font-semibold">Schedule warnings:</p>

                            <ul className="list-inside list-disc space-y-1">
                                {monthWarnings.map((warning) => (
                                    <li key={warning}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-3">
                        {monthSchedule.map((day) => (
                            <div
                                key={day.date}
                                className="rounded-xl border bg-background p-4"
                            >
                                <p className="mb-2 font-medium">{day.date}</p>

                                {day.chores.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No chores scheduled.
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {day.chores.map((chore) => {
                                            const kid = kids.find(
                                                (item) => item.id === chore.assignedKidId
                                            );

                                            return (
                                                <p
                                                    key={`${day.date}-${chore.id}-${chore.assignedKidId}`}
                                                    className="text-sm"
                                                >
                                                    <span className="font-medium">{kid?.name}</span>:{" "}
                                                    {chore.title}{" "}
                                                    <span className="text-muted-foreground">
                                                        ({chore.frequency})
                                                    </span>
                                                </p>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}