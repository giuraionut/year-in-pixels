import { Event } from "@prisma/client";

export type AddEventDialogProps = {
    children: React.ReactNode;
};
export type EditEventDialogProps = {
    event: Event,
    children: React.ReactNode;
};
export type EventsTableProps = {
    data: Event[];
    loading: boolean;
};

export type ConfirmDeleteEventModalProps = {
    children: React.ReactNode;
} & ({ event: Event; events?: never } | { events: Event[]; event?: never });


