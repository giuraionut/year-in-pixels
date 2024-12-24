import { Event } from "@prisma/client";

export type AddEventDialogProps = {
    children: React.ReactNode;
    setUserEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};
export type EditEventDialogProps = {
    event: Event,
    children: React.ReactNode;
    setUserEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};
export type EventsTableProps = {
    data: Event[];
    setUserEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    loading: boolean;
};

export type Color = {
    name: string;
    value: string;
};

export type ConfirmDeleteEventModalProps = {
    setUserEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    children: React.ReactNode;
} & ({ event: Event; events?: never } | { events: Event[]; event?: never });


