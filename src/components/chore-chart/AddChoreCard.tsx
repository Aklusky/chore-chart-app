import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChoreDay, ChoreFrequency } from "@/types/chore";

type Props = {
    newChoreTitle: string;
    setNewChoreTitle: (value: string) => void;
    newChoreFrequency: ChoreFrequency;
    setNewChoreFrequency: (value: ChoreFrequency) => void;
    newChoreDay: ChoreDay;
    setNewChoreDay: (value: ChoreDay) => void;
    addChore: () => void;
};
export function AddChoreCard({
    newChoreTitle,
    setNewChoreTitle,
    newChoreFrequency,
    setNewChoreFrequency,
    newChoreDay,
    setNewChoreDay,
    addChore,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add a chore</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 sm:flex-row">
                <Input
                    value={newChoreTitle}
                    onChange={(e) => setNewChoreTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") addChore();
                    }}
                    placeholder="Chore name"
                />

                <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={newChoreFrequency}
                    onChange={(e) =>
                        setNewChoreFrequency(e.target.value as ChoreFrequency)
                    }
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>

                </select>
                {newChoreFrequency !== "daily" && (
                    <select
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                        value={newChoreDay}
                        onChange={(e) => setNewChoreDay(e.target.value as ChoreDay)}
                    >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                    </select>
                )}
                <Button onClick={addChore}>Add Chore</Button>
            </CardContent>
        </Card>
    );
}