import EventScheduler from "@/components/EventScheduler/EventScheduler";

export default function Home() {
  return (
    <div className="flex items-center justify-center flex-col">
      <h1 className="w-full px-8 md:px-60 text-2xl md:text-4xl font-medium text-gray-500 p-4">Event Scheduler</h1>
      <div className="h-[2px] w-full bg-black"></div>
      <EventScheduler />
    </div>
  );
}
