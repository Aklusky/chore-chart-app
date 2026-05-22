import type { Kid } from "@/types/kids";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    kids: Kid[];
    selectedKidId: string;
    setSelectedKidId: (value: string) => void;
    deleteKid: (kidId: string) => void;
};

export function KidSelectorCard({
    kids,
    selectedKidId,
    setSelectedKidId,
    deleteKid,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Choose a kid</CardTitle>
            </CardHeader>

            <CardContent>
                {kids.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Add a kid to view their chores.
                    </p>
                ) : (
                    <Tabs value={selectedKidId} onValueChange={setSelectedKidId}>
                        <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                            {kids.map((kid) => (
                                <div key={kid.id} className="flex items-center gap-1">
                                    <TabsTrigger value={kid.id}>{kid.name}</TabsTrigger>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteKid(kid.id);
                                        }}
                                    >
                                        X
                                    </Button>
                                </div>
                            ))}
                        </TabsList>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}