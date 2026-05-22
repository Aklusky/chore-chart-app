import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/utils/date";

type Props = {
    selectedDate: string;
    setSelectedDate: (value: string) => void;
    choresPerKidPerDay: number;
    setChoresPerKidPerDay: (value: number) => void;
};

export function ScheduleSettingsCard({
    selectedDate,
    setSelectedDate,
    choresPerKidPerDay,
    setChoresPerKidPerDay,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule settings</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 sm:flex-row">
                <div>
                    <p className="mb-1 text-sm font-medium">View date</p>

                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const currentDate = new Date(`${selectedDate}T00:00:00`);

                                currentDate.setDate(currentDate.getDate() + 1);

                                const nextDate = toDateInputValue(currentDate);

                                setSelectedDate(nextDate);
                            }}
                        >
                            Next Day
                        </Button>
                    </div>
                </div>

                <div>
                    <p className="mb-1 text-sm font-medium">Target chores per kid</p>
                    <Input
                        type="number"
                        min="1"
                        value={choresPerKidPerDay}
                        onChange={(e) => setChoresPerKidPerDay(Number(e.target.value))}
                        className="max-w-24"
                    />
                </div>
            </CardContent>
        </Card>
    );
}