import { useMemo } from "react";
import type { AssignedChore, Chore, ChoreDay } from "@/types/chore";
import type { Kid } from "@/types/kids";
import { getDayNumber, getWeekNumber, isWeekday } from "@/utils/date";

type Props = {
    kids: Kid[];
    chores: Chore[];
    selectedDate: string;
    selectedKidId: string;
    completed: string[];
    choresPerKidPerDay: number;
};

function getChoreDayKey(dateString: string): ChoreDay | "sunday" | "saturday" {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ] as const;

    return days[new Date(`${dateString}T00:00:00`).getDay()];
}

function getNthScheduledDayOfMonth(
    dateString: string,
    scheduledDay?: ChoreDay
) {
    if (!scheduledDay) return -1;

    const targetDayMap: Record<ChoreDay, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
    };

    const date = new Date(`${dateString}T00:00:00`);
    const targetDay = targetDayMap[scheduledDay];

    if (date.getDay() !== targetDay) return -1;

    let occurrence = -1;

    for (let day = 1; day <= date.getDate(); day++) {
        const testDate = new Date(date.getFullYear(), date.getMonth(), day);

        if (testDate.getDay() === targetDay) {
            occurrence++;
        }
    }

    return occurrence;
}

export function useChoreScheduler({
    kids,
    chores,
    selectedDate,
    selectedKidId,
    completed,
    choresPerKidPerDay,
}: Props) {
    function getAssignmentsForDate(dateString: string): AssignedChore[] {
        if (kids.length === 0 || !isWeekday(dateString)) return [];

        const dateNumber = getDayNumber(dateString);
        const weekNumber = getWeekNumber(dateString);
        const selectedDayKey = getChoreDayKey(dateString);

        const assignedCounts: Record<string, number> = {};
        const assignedChores: AssignedChore[] = [];

        kids.forEach((kid) => {
            assignedCounts[kid.id] = 0;
        });

        function assignChore(chore: Chore) {
            const kidsWithOpenSlots = kids.filter(
                (kid) => assignedCounts[kid.id] < choresPerKidPerDay
            );

            if (kidsWithOpenSlots.length === 0) return;

            const kidWithFewestChores = kidsWithOpenSlots.reduce((lowest, kid) =>
                assignedCounts[kid.id] < assignedCounts[lowest.id] ? kid : lowest
            );

            assignedCounts[kidWithFewestChores.id] += 1;

            assignedChores.push({
                ...chore,
                assignedKidId: kidWithFewestChores.id,
            });
        }

        const dailyChores = chores.filter((chore) => chore.frequency === "daily");

        dailyChores.forEach((chore, index) => {
            const rotatedKids = [...kids].sort((a, b) => {
                const aIndex = kids.findIndex((kid) => kid.id === a.id);
                const bIndex = kids.findIndex((kid) => kid.id === b.id);

                return (
                    (aIndex + dateNumber + chore.rotationOffset + index) % kids.length -
                    (bIndex + dateNumber + chore.rotationOffset + index) % kids.length
                );
            });

            const kidWithOpenSlot = rotatedKids.find(
                (kid) => assignedCounts[kid.id] < choresPerKidPerDay
            );

            if (!kidWithOpenSlot) return;

            assignedCounts[kidWithOpenSlot.id] += 1;

            assignedChores.push({
                ...chore,
                assignedKidId: kidWithOpenSlot.id,
            });
        });

        const weeklyDueToday = chores.filter(
            (chore) =>
                chore.frequency === "weekly" && chore.scheduledDay === selectedDayKey
        );

        const biweeklyDueToday = chores.filter(
            (chore) =>
                chore.frequency === "biweekly" &&
                chore.scheduledDay === selectedDayKey &&
                (weekNumber + chore.rotationOffset) % 2 === 0
        );

        const monthlyDueToday = chores.filter((chore) => {
            if (chore.frequency !== "monthly") return false;
            if (chore.scheduledDay !== selectedDayKey) return false;

            const monthlyChoresForThisDay = chores.filter(
                (item) =>
                    item.frequency === "monthly" &&
                    item.scheduledDay === chore.scheduledDay
            );

            const choreMonthlyIndex = monthlyChoresForThisDay.findIndex(
                (item) => item.id === chore.id
            );

            return (
                choreMonthlyIndex ===
                getNthScheduledDayOfMonth(dateString, chore.scheduledDay)
            );
        });

        const fillerChores = [
            ...monthlyDueToday,
            ...biweeklyDueToday,
            ...weeklyDueToday,
        ];

        fillerChores.forEach(assignChore);

        kids.forEach((kid) => {
            while (assignedCounts[kid.id] < choresPerKidPerDay) {
                assignedCounts[kid.id] += 1;

                assignedChores.push({
                    id: `misc-${kid.id}-${dateString}-${assignedCounts[kid.id]}`,
                    title: "Misc Chore",
                    frequency: "weekly",
                    rotationOffset: 0,
                    scheduledDay: undefined,
                    assignedKidId: kid.id,
                });
            }
        });

        return assignedChores;
    }

    const choresWithAssignments = useMemo(() => {
        return getAssignmentsForDate(selectedDate);
    }, [kids, chores, selectedDate, choresPerKidPerDay]);

    const todaysChores = useMemo(() => {
        return choresWithAssignments.filter(
            (chore) => chore.assignedKidId === selectedKidId
        );
    }, [choresWithAssignments, selectedKidId]);

    const progress =
        todaysChores.length === 0
            ? 0
            : Math.round(
                (todaysChores.filter((chore) => completed.includes(chore.id)).length /
                    todaysChores.length) *
                100
            );

    const monthSchedule = useMemo(() => {
        const date = new Date(`${selectedDate}T00:00:00`);
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: lastDay }, (_, index) => {
            const day = index + 1;
            const dateString = new Date(year, month, day)
                .toISOString()
                .split("T")[0];

            return {
                date: dateString,
                chores: getAssignmentsForDate(dateString),
            };
        });
    }, [kids, chores, selectedDate, choresPerKidPerDay]);

    const monthWarnings = useMemo(() => {
        const warnings: string[] = [];

        chores.forEach((chore) => {
            if (chore.frequency === "daily") return;

            const scheduledCount = monthSchedule.reduce((count, day) => {
                return day.chores.some((item) => item.id === chore.id)
                    ? count + 1
                    : count;
            }, 0);

            if (chore.frequency === "weekly" && scheduledCount === 0) {
                warnings.push(`${chore.title} is weekly but was not scheduled.`);
            }

            if (chore.frequency === "biweekly" && scheduledCount === 0) {
                warnings.push(`${chore.title} is biweekly but was not scheduled.`);
            }

            if (chore.frequency === "monthly" && scheduledCount === 0) {
                warnings.push(`${chore.title} is monthly but was not scheduled.`);
            }
        });

        return warnings;
    }, [chores, monthSchedule]);

    return {
        choresWithAssignments,
        todaysChores,
        progress,
        monthSchedule,
        monthWarnings,
    };
}