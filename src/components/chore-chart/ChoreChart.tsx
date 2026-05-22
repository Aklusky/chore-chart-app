import { useEffect, useState } from "react";
import { Bell, CalendarDays } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { createInvite } from "@/firebase/inviteService";

import { auth } from "@/firebase/firebase";

import {
    getKids,
    addKid as saveKid,
    getChores,
    addChore as saveChore,
    deleteChore as removeChore,
} from "@/firebase/choreService";

import {
    getCompletedChores,
    saveCompletedChores,
} from "@/firebase/completionService";

import { getUserProfile, type UserProfile } from "@/firebase/userService";

import { useChoreScheduler } from "@/hooks/useChoreScheduler";
import { getTodayInputValue, toDateInputValue } from "@/utils/date";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LoginCard } from "@/components/auth/LoginCard";

import { AddKidCard } from "./AddKidCard";
import { AddChoreCard } from "./AddChoreCard";
import { ConfiguredChoresCard } from "./ConfiguredChoresCard";
import { ScheduleSettingsCard } from "./ScheduleSettingsCard";
import { RotationPreviewCard } from "./RotationPreviewCard";
import { KidSelectorCard } from "./KidSelectorCard";
import { KidChoresCard } from "./KidChoresCard";
import { MonthScheduleCard } from "./MonthScheduleCard";

import type { Chore, ChoreDay, ChoreFrequency } from "@/types/chore";
import type { Kid } from "@/types/kids";

type MissedChore = {
    id: string;
    title: string;
    assignedKidName: string;
    assignedKidId: string;
    dueDate: string;
};

function isSunday(dateString: string) {
    return new Date(`${dateString}T00:00:00`).getDay() === 0;
}

function getWeekDatesBeforeSelected(dateString: string) {
    const selected = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = selected.getDay();

    if (dayOfWeek === 0) return [];

    const dates: string[] = [];

    for (let i = dayOfWeek - 1; i >= 1; i--) {
        const date = new Date(selected);
        date.setDate(selected.getDate() - i);
        dates.push(toDateInputValue(date));
    }

    return dates;
}

export default function ChoreChart() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [kids, setKids] = useState<Kid[]>([]);
    const [chores, setChores] = useState<Chore[]>([]);
    const [selectedKidId, setSelectedKidId] = useState("");
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
    const [newKidName, setNewKidName] = useState("");
    const [newChoreTitle, setNewChoreTitle] = useState("");
    const [newChoreFrequency, setNewChoreFrequency] =
        useState<ChoreFrequency>("daily");
    const [newChoreDay, setNewChoreDay] = useState<ChoreDay>("monday");
    const [choresPerKidPerDay, setChoresPerKidPerDay] = useState(1);

    const [completed, setCompleted] = useState<string[]>([]);
    const [missedChores, setMissedChores] = useState<MissedChore[]>([]);
    const [showMonth, setShowMonth] = useState(false);

    const [inviteCode, setInviteCode] = useState("");
    const [inviteRole, setInviteRole] = useState<"kid" | "parent">("kid");

    const familyId = userProfile?.familyId ?? "";
    const userRole = userProfile?.role ?? "kid";
    const isParent = userRole === "parent";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const uid = user?.uid ?? "";
        const email = user?.email ?? "";

        if (!uid) return;

        async function loadProfile() {
            try {
                const profile = await getUserProfile(uid, email);
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to load user profile:", error);
            }
        }

        loadProfile();
    }, [user]);

    useEffect(() => {
        if (!familyId) return;

        async function loadData() {
            setLoading(true);

            try {
                const [kidsFromDb, choresFromDb] = await Promise.all([
                    getKids(familyId),
                    getChores(familyId),
                ]);

                setKids(kidsFromDb);
                setChores(choresFromDb);

                if (kidsFromDb.length > 0) {
                    setSelectedKidId(kidsFromDb[0].id);
                }
            } catch (error) {
                console.error("Failed to load Firestore data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [familyId]);

    const selectedKid = kids.find((kid) => kid.id === selectedKidId);

    const {
        choresWithAssignments,
        todaysChores,
        progress,
        monthSchedule,
        monthWarnings,
    } = useChoreScheduler({
        kids,
        chores,
        selectedDate,
        selectedKidId,
        completed,
        choresPerKidPerDay,
    });

    useEffect(() => {
        if (!familyId) return;

        async function loadCompleted() {
            try {
                const completedFromDb = await getCompletedChores(
                    familyId,
                    selectedDate
                );

                setCompleted(completedFromDb);
            } catch (error) {
                console.error("Failed to load completed chores:", error);
            }
        }

        loadCompleted();
    }, [familyId, selectedDate]);

    useEffect(() => {
        if (!familyId) return;

        async function loadMissed() {
            try {
                if (isSunday(selectedDate)) {
                    setMissedChores([]);
                    return;
                }

                const weekDates = getWeekDatesBeforeSelected(selectedDate);

                const missedForWeek = await Promise.all(
                    weekDates.map(async (date) => {
                        const completedForDate = await getCompletedChores(familyId, date);

                        return (
                            monthSchedule
                                .find((day) => day.date === date)
                                ?.chores.filter((chore) => !completedForDate.includes(chore.id))
                                .map((chore) => {
                                    const assignedKid = kids.find(
                                        (kid) => kid.id === chore.assignedKidId
                                    );

                                    return {
                                        id: chore.id,
                                        title: chore.title,
                                        assignedKidName: assignedKid?.name ?? "Unknown",
                                        assignedKidId: chore.assignedKidId,
                                        dueDate: date,
                                    };
                                }) ?? []
                        );
                    })
                );

                setMissedChores(missedForWeek.flat());
            } catch (error) {
                console.error("Failed to load missed chores:", error);
            }
        }

        loadMissed();
    }, [familyId, selectedDate, monthSchedule, kids]);

    const selectedKidMissedChores = missedChores.filter(
        (chore) => chore.assignedKidId === selectedKidId
    );

    const allowanceEligible = selectedKidMissedChores.length === 0;

    async function generateInvite() {
        if (!familyId || !isParent) return;

        try {
            const code = await createInvite(familyId, inviteRole);
            setInviteCode(code);
        } catch (error) {
            console.error("Failed to create invite:", error);
        }
    }

    async function toggleChore(id: string) {
        if (!familyId) return;

        const updatedCompleted = completed.includes(id)
            ? completed.filter((choreId) => choreId !== id)
            : [...completed, id];

        setCompleted(updatedCompleted);

        await saveCompletedChores(familyId, selectedDate, updatedCompleted);
    }

    async function addKid() {
        if (!familyId || !newKidName.trim() || !isParent) return;

        const kid = await saveKid(familyId, newKidName.trim());

        setKids((current) => [...current, kid]);

        if (!selectedKidId) {
            setSelectedKidId(kid.id);
        }

        setNewKidName("");
    }

    async function addChore() {
        if (!familyId || !newChoreTitle.trim() || !isParent) return;

        const baseChore = {
            title: newChoreTitle.trim(),
            rotationOffset: kids.length === 0 ? 0 : chores.length % kids.length,
            frequency: newChoreFrequency,
        };

        const chore = await saveChore(
            familyId,
            newChoreFrequency === "daily"
                ? baseChore
                : {
                    ...baseChore,
                    scheduledDay: newChoreDay,
                }
        );

        setChores((current) => [...current, chore]);

        setNewChoreTitle("");
        setNewChoreFrequency("daily");
        setNewChoreDay("monday");
    }

    async function deleteChore(choreId: string) {
        if (!familyId || !isParent) return;

        await removeChore(familyId, choreId);

        setChores((current) => current.filter((chore) => chore.id !== choreId));
        setCompleted((current) => current.filter((id) => id !== choreId));
    }

    function rotateChore(choreId: string) {
        if (!isParent) return;

        setChores((current) =>
            current.map((chore) =>
                chore.id === choreId
                    ? {
                        ...chore,
                        rotationOffset:
                            kids.length === 0
                                ? 0
                                : (chore.rotationOffset + 1) % kids.length,
                    }
                    : chore
            )
        );
    }

    if (authLoading || loading) {
        return (
            <main className="min-h-screen bg-muted/40 p-4">
                <div className="mx-auto max-w-5xl">
                    <p className="text-muted-foreground">Loading chore chart...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-muted/40 p-4">
                <div className="mx-auto max-w-md">
                    <LoginCard />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-muted/40 p-4">
            <div className="mx-auto max-w-5xl space-y-4">
                <section className="space-y-2">
                    <Badge variant="secondary" className="gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Chore Chart
                    </Badge>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Family Chore Dashboard
                    </h1>

                    <p className="text-muted-foreground">
                        Logged in as {user.email} · Role: {userRole}
                    </p>
                </section>

                {isParent && (
                    <ScheduleSettingsCard
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        choresPerKidPerDay={choresPerKidPerDay}
                        setChoresPerKidPerDay={setChoresPerKidPerDay}
                    />
                )}

                <MonthScheduleCard
                    showMonth={showMonth}
                    setShowMonth={setShowMonth}
                    monthSchedule={monthSchedule}
                    monthWarnings={monthWarnings}
                    kids={kids}
                    chores={chores}
                />

                <RotationPreviewCard
                    chores={chores}
                    kids={kids}
                    selectedDate={selectedDate}
                    choresWithAssignments={choresWithAssignments}
                    rotateChore={rotateChore}
                    deleteChore={deleteChore}
                />

                <KidSelectorCard
                    kids={kids}
                    selectedKidId={selectedKidId}
                    setSelectedKidId={setSelectedKidId}
                    deleteKid={() => { }}
                />

                <KidChoresCard
                    selectedKid={selectedKid}
                    selectedDate={selectedDate}
                    progress={progress}
                    todaysChores={todaysChores}
                    completed={completed}
                    toggleChore={toggleChore}
                    allowanceEligible={allowanceEligible}
                    missedChores={selectedKidMissedChores}
                />

                {isParent && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Family Invites</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={inviteRole === "kid" ? "default" : "outline"}
                                        onClick={() => setInviteRole("kid")}
                                    >
                                        Kid Invite
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={inviteRole === "parent" ? "default" : "outline"}
                                        onClick={() => setInviteRole("parent")}
                                    >
                                        Parent Invite
                                    </Button>
                                </div>

                                <Button onClick={generateInvite}>
                                    Create {inviteRole} Invite
                                </Button>

                                {inviteCode && (
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-sm font-medium">Invite Code</p>

                                        <p className="font-mono text-lg tracking-widest">
                                            {inviteCode}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Give this code to the person you want to add to the
                                            family.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <AddKidCard
                            newKidName={newKidName}
                            setNewKidName={setNewKidName}
                            addKid={addKid}
                        />

                        <AddChoreCard
                            newChoreTitle={newChoreTitle}
                            setNewChoreTitle={setNewChoreTitle}
                            newChoreFrequency={newChoreFrequency}
                            setNewChoreFrequency={setNewChoreFrequency}
                            newChoreDay={newChoreDay}
                            setNewChoreDay={setNewChoreDay}
                            addChore={addChore}
                        />

                        <ConfiguredChoresCard
                            chores={chores}
                            rotateChore={rotateChore}
                            deleteChore={deleteChore}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Reminder Setup
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <Button variant="secondary">Enable reminders later</Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </main>
    );
}