import { Mood } from "@prisma/client";

export type AddMoodDialogProps = {
    children: React.ReactNode;
};
export type EditMoodDialogProps = {
    mood: Mood,
    children: React.ReactNode;
};
export type MoodsTableProps = {
    data: Mood[];
};


export type ConfirmDeleteMoodDialogProps = {
    children: React.ReactNode;
} & ({ mood: Mood; moods?: never } | { moods: Mood[]; mood?: never });

