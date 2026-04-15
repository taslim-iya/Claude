import { useState } from 'react';
import { Clock, Zap, Globe } from 'lucide-react';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];
const TIMEZONES = [
  "Recipient's local timezone","UTC","America/New_York (EST)","America/Chicago (CST)","America/Denver (MST)","America/Los_Angeles (PST)",
  "Europe/London (GMT)","Europe/Paris (CET)","Asia/Tokyo (JST)","Asia/Singapore (SGT)","Australia/Sydney (AEDT)",
];

interface SendingScheduleProps {
  onChange?: (schedule: ScheduleConfig) => void;
}

export interface ScheduleConfig {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  optimalSend: boolean;
  throttleRate: number;
}

export default function SendingSchedule({ onChange }: SendingScheduleProps) {
  const [days, setDays] = useState<string[]>(['Mon','Tue','Wed','Thu','Fri']);
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('5:00 PM');
  const [timezone, setTimezone] = useState("Recipient's local timezone");
  const [optimalSend, setOptimalSend] = useState(false);
  const [throttleRate, setThrottleRate] = useState(100);

  const notify = (update: Partial<ScheduleConfig>) => {
    onChange?.({ days, startTime, endTime, timezone, optimalSend, throttleRate, ...update });
  };

  const toggleDay = (day: string) => {
    const next = days.includes(day) ? days.filter(d=>d!==day) : [...days, day];
    setDays(next);
    notify({ days: next });
  };

  return (
    <div className="space-y-4">
      {/* Days of week */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{ color:'var(--text-2)' }}>Send Days</label>
        <div className="flex gap-1.5">
          {DAYS.map(d => (
            <button key={d} type="button" onClick={()=>toggleDay(d)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: days.includes(d)?'rgba(91,110,249,0.25)':'var(--surface-2)',
                color: days.includes(d)?'#5b6ef9':'var(--text-2)',
                border: days.includes(d)?'1px solid rgba(91,110,249,0.4)':'1px solid var(--border)'
              }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Time window */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{ color:'var(--text-2)' }}>
          <Clock size={11} className="inline mr-1"/>Send Window
        </label>
        <div className="flex items-center gap-2">
          <select value={startTime} onChange={e=>{setStartTime(e.target.value);notify({startTime:e.target.value});}}
            className="flex-1 px-3 py-2 text-xs rounded-lg outline-none"
            style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
            {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
          <span className="text-xs" style={{ color:'var(--text-2)' }}>to</span>
          <select value={endTime} onChange={e=>{setEndTime(e.target.value);notify({endTime:e.target.value});}}
            className="flex-1 px-3 py-2 text-xs rounded-lg outline-none"
            style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
            {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{ color:'var(--text-2)' }}>
          <Globe size={11} className="inline mr-1"/>Timezone
        </label>
        <select value={timezone} onChange={e=>{setTimezone(e.target.value);notify({timezone:e.target.value});}}
          className="w-full px-3 py-2 text-xs rounded-lg outline-none"
          style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
          {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* Optimal send time */}
      <div className="flex items-center justify-between p-3 rounded-xl"
        style={{ background:'rgba(91,110,249,0.08)', border:'1px solid rgba(91,110,249,0.15)' }}>
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color:'#5b6ef9' }}/>
          <div>
            <p className="text-xs font-semibold" style={{ color:"var(--text)" }}>Optimal Send Time</p>
            <p className="text-[11px]" style={{ color:'var(--text-2)' }}>AI picks the best time for each recipient</p>
          </div>
        </div>
        <button type="button" onClick={()=>{const v=!optimalSend;setOptimalSend(v);notify({optimalSend:v});}}
          className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
          style={{ background:optimalSend?'#5b6ef9':'var(--surface-3)' }}>
          <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white"
            style={{ left:optimalSend?'calc(100% - 18px)':'2px' }}/>
        </button>
      </div>

      {/* Throttle rate */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color:'var(--text-2)' }}>Max Emails Per Hour</label>
          <span className="text-sm font-bold" style={{ color:'#5b6ef9' }}>{throttleRate}</span>
        </div>
        <input type="range" min={5} max={500} step={5} value={throttleRate}
          onChange={e=>{const v=+e.target.value;setThrottleRate(v);notify({throttleRate:v});}}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background:`linear-gradient(to right, #5b6ef9 ${(throttleRate-5)/495*100}%, var(--border-2) ${(throttleRate-5)/495*100}%)` }}
        />
        <div className="flex justify-between text-[10px] mt-1" style={{ color:'var(--text-3)' }}>
          <span>5</span><span>500</span>
        </div>
      </div>
    </div>
  );
}
