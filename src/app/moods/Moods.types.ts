import { Mood } from "@prisma/client";

export type AddMoodDialogProps = {
    children: React.ReactNode;
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
};
export type MoodsTableProps = {
    data: Mood[];
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
};
