import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
    newKidName: string;
    setNewKidName: (value: string) => void;
    addKid: () => void;
};

export function AddKidCard({ newKidName, setNewKidName, addKid }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add a kid</CardTitle>
            </CardHeader>

            <CardContent className="flex gap-2">
                <Input
                    value={newKidName}
                    onChange={(e) => setNewKidName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") addKid();
                    }}
                    placeholder="Kid name"
                />

                <Button onClick={addKid}>Add Kid</Button>
            </CardContent>
        </Card>
    );
}