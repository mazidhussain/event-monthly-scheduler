"use client"
import React, { useState } from 'react';
import { Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { dayNames, monthNames } from '@/lib/constants';

interface Event {
    id: number;
    title: string;
    description: string;
}

interface EventMap {
    [key: string]: Event[];
}

const EventScheduler: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<EventMap>({});
    const [showEventForm, setShowEventForm] = useState<boolean>(false);
    const [editingEvent, setEditingEvent] = useState<number | null>(null);
    const [eventTitle, setEventTitle] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [showEventList, setShowEventList] = useState<boolean>(false);
    const [selectedEvents, setSelectedEvents] = useState<string>("")

    const getDaysInMonth = (date: Date): number[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const getFirstDayOfMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (increment: number): void => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
    };

    const formatDateKey = (date: Date): string => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };

    const handleDateClick = (day: number): void => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(selectedDate);
        setShowEventForm(true);
        setEditingEvent(null);
        setEventTitle('');
        setEventDescription('');
    };

    const handleEventSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!selectedDate) return;

        const dateKey = formatDateKey(selectedDate);

        if (editingEvent) {
            const updatedEvents = { ...events };
            const eventIndex = updatedEvents[dateKey].findIndex(event => event.id === editingEvent);
            updatedEvents[dateKey][eventIndex] = {
                id: editingEvent,
                title: eventTitle,
                description: eventDescription
            };
            setEvents(updatedEvents);
        } else {
            const newEvent: Event = {
                id: Date.now(),
                title: eventTitle,
                description: eventDescription
            };
            setEvents(prev => ({
                ...prev,
                [dateKey]: [...(prev[dateKey] || []), newEvent]
            }));
        }

        setShowEventForm(false);
        setEventTitle('');
        setEventDescription('');
        setEditingEvent(null);
    };

    const handleDeleteEvent = (e: any, dateKey: string, eventId: number): void => {
        const updatedEvents = { ...events };
        updatedEvents[dateKey] = events[dateKey].filter(event => event.id !== eventId);
        if (updatedEvents[dateKey].length === 0) {
            delete updatedEvents[dateKey];
        }
        setEvents(updatedEvents);
    };

    const handleEditEvent = (dateKey: string, event: Event): void => {
        setSelectedDate(new Date(dateKey));
        setEventTitle(event.title);
        setEventDescription(event.description);
        setEditingEvent(event.id);
        setShowEventForm(true);
        setShowEventList(false);
    };

    const renderCellEvents = (dateKey: string) => {
        if (!events[dateKey]) return null;

        return events[dateKey].slice(0, 3).map((event, index) => (
            <div className='flex items-center group gap-1' key={event.id}>
                <div
                    key={event.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(dateKey, event);
                    }}
                    className={`text-xs p-1 mb-1 rounded bg-blue-100 hover:bg-blue-200  cursor-pointer truncate`}
                >
                    {event.title}
                </div>
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => handleDeleteEvent(e, selectedEvents, event.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            </div>
        ));
    };

    const renderRemainingCount = (dateKey: string) => {
        const count = events[dateKey]?.length ?? 0;
        if (count <= 3) return null;

        return (
            <div className="text-xs text-gray-600 hover:text-gray-800" onClick={(e) => handleShowEvents(e, dateKey)}>
                +{count - 3} more
            </div>
        );
    };

    const handleShowEvents = (e: any, dateKey: string) => {
        e.stopPropagation();
        setShowEventList(true)
        setSelectedEvents(dateKey);
    }

    return (
        <div className="sm:p-4 md:px-60 md:w-full font-sans">
            <div className="bg-white rounded-lg shadow-lg mb-6">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square"></div>
                        ))}

                        {getDaysInMonth(currentDate).map(day => {
                            const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                            const remainingCount = renderRemainingCount(dateKey)
                            const hasEvents = events[dateKey]?.length > 0;

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`aspect-square p-2 rounded-lg cursor-pointer relative border border-gray-200 hover:bg-gray-50 transition-colors ${hasEvents ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                                >
                                    <div className="flex justify-between md:flex-col items-start h-full">
                                        <span className="text-gray-700">{day}</span>
                                        {hasEvents && (
                                            <span className="inline-flex md:hidden absolute top-[-14px] right-[-9px] items-center justify-center a w-6 h-6 text-xs font-semibold rounded-full bg-blue-500 text-white">
                                                {events[dateKey].length}
                                            </span>
                                        )}
                                        <div className='hidden md:block'>
                                            {
                                                hasEvents &&
                                                renderCellEvents(dateKey)
                                            }
                                            {
                                                remainingCount &&
                                                remainingCount
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg block md:hidden">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Events</h2>
                </div>
                <div className="p-4 space-y-4">
                    {Object.entries(events).map(([dateKey, dateEvents]) => (
                        <div key={dateKey} className="border-b border-gray-200 pb-4 last:border-0">
                            <h3 className="font-semibold text-gray-700 mb-2">
                                {new Date(dateKey).toLocaleDateString()}
                            </h3>
                            <div className="space-y-2">
                                {dateEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="bg-gray-50 p-3 rounded-lg flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-800">{event.title}</div>
                                            <div className="text-sm text-gray-600">{event.description}</div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditEvent(dateKey, event)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteEvent(e, dateKey, event.id)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {
                        Object.entries(events).length == 0 &&
                        <div className='flex items-center justify-center h-3'>
                            No Events
                        </div>
                    }
                </div>
            </div>

            {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingEvent ? 'Edit Event' : 'Add New Event'}
                            </h3>
                            <button
                                onClick={() => setShowEventForm(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleEventSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEventForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    {editingEvent ? 'Update Event' : 'Add Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {showEventList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Event Listing
                            </h3>
                            <button
                                onClick={() => setShowEventList(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-2 p-3">
                            {events[selectedEvents].map(event => (
                                <div
                                    key={event.id}
                                    className="bg-gray-50 p-3 rounded-lg flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium text-gray-800">{event.title}</div>
                                        <div className="text-sm text-gray-600">{event.description}</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditEvent(selectedEvents, event)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteEvent(e, selectedEvents, event.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventScheduler;