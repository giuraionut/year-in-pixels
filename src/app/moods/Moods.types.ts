import { Mood } from "@prisma/client";

export type AddMoodDialogProps = {
    children: React.ReactNode;
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
};
export type EditMoodDialogProps = {
    mood: Mood,
    children: React.ReactNode;
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
};
export type MoodsTableProps = {
    data: Mood[];
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
    loading: boolean;
};

export type Color = {
    name: string;
    value: string;
};

