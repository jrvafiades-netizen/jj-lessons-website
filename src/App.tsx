import { Fragment, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import bioLeft from './assets/bio-left.png';
import bioRight from './assets/bio-right.png';

type TimeSlot = {
  id: string;
  day: string;
  date: string;
  isoDate: string;
  time: string;
  available: boolean;
};

const recipientEmail = 'jrvafiades@gmail.com';

const times = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
];

const unavailableSlots = new Set(['Tue-10:00 AM', 'Thu-2:00 PM', 'Fri-12:00 PM', 'Sat-9:00 AM']);

const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const addDays = (date: Date, daysToAdd: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

const getIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const currentWeekStart = useMemo(() => getStartOfWeek(new Date()), []);
  const currentDayIso = useMemo(() => getIsoDate(new Date()), []);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, dayOffset) => {
        const date = addDays(weekStart, dayOffset);

        return {
          day: dayFormatter.format(date),
          date: dateFormatter.format(date),
          isoDate: getIsoDate(date),
        };
      }),
    [weekStart],
  );

  const slots = useMemo<TimeSlot[]>(
    () =>
      days.flatMap(({ day, date, isoDate }) =>
        times.map((time) => {
          const id = `${isoDate}-${time}`;
          const availabilityKey = `${day}-${time}`;
          const isPastDay = isoDate < currentDayIso;

          return {
            id,
            day,
            date,
            isoDate,
            time,
            available: !isPastDay && !unavailableSlots.has(availabilityKey),
          };
        }),
      ),
    [currentDayIso, days],
  );

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const canViewPreviousWeek = weekStart.getTime() > currentWeekStart.getTime();
  const mailtoHref = selectedSlot
    ? `mailto:${recipientEmail}?subject=${encodeURIComponent('Lesson booking request')}&body=${encodeURIComponent(
        `Selected lesson time: ${selectedSlot.day}, ${selectedSlot.date} at ${selectedSlot.time} for 1 hour\nContact: ${contact}\nNotes: ${notes || 'None'}`,
      )}`
    : `mailto:${recipientEmail}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!selectedSlot || !contact.trim()) {
      event.preventDefault();
      setStatus('Choose a time slot and enter an email or phone number.');
      return;
    }

    setStatus('Sending your lesson request...');

    window.setTimeout(() => {
      setStatus('Request sent. I will follow up to confirm the lesson time.');
    }, 700);
  };

  const changeWeek = (weekOffset: number) => {
    setWeekStart((visibleWeekStart) => addDays(visibleWeekStart, weekOffset * 7));
    setSelectedSlotId('');
    setStatus('');
  };

  const showPreviousWeek = () => {
    if (!canViewPreviousWeek) {
      return;
    }

    changeWeek(-1);
  };

  return (
    <main className="page-shell">
      <section className="intro">
        <img className="intro-image" src={bioLeft} alt="James Vafiades having his hand raised after a jiu-jitsu match" />
        <div className="intro-copy">
          <p className="eyebrow">Private lessons</p>
          <h1>Bio</h1>
          <p>
            My name is James Vafiades, and I'm a jiu jitsu black belt with more than 12 years of experience. I've competed at the highest levels and learned from the best in the sport.
            My passion is sharing what I've learned with other grapplers.
            If you want to take your jiu jitsu to the next level, then book a private lesson with me in South Boston.
          </p>
        </div>
        <img className="intro-image" src={bioRight} alt="James Vafiades celebrating after a jiu-jitsu match" />
      </section>

      <section className="booking" aria-labelledby="booking-title">
        <div className="booking-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2 id="booking-title">book a lesson today.</h2>
          </div>
          <div className="calendar-controls" aria-label="Calendar navigation">
            <button type="button" aria-label="Previous week" onClick={showPreviousWeek} disabled={!canViewPreviousWeek}>
              &lsaquo;
            </button>
            <button type="button" aria-label="Next week" onClick={() => changeWeek(1)}>
              &rsaquo;
            </button>
          </div>
        </div>

        <form
          className="booking-form"
          action={`https://formsubmit.co/${recipientEmail}`}
          method="POST"
          target="booking-frame"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="_subject" value="New lesson booking request" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="selected_slot" value={selectedSlot ? `${selectedSlot.day}, ${selectedSlot.date} at ${selectedSlot.time} for 1 hour` : ''} />
          <input type="hidden" name="contact" value={contact} />
          <input type="hidden" name="notes" value={notes} />

          <div className="calendar" role="grid" aria-label="Available lesson times">
            <div className="time-gutter" aria-hidden="true" />
            {days.map(({ day, date, isoDate }) => (
              <div className="day-heading" key={isoDate} role="columnheader">
                <span>{day}</span>
                <strong>{date}</strong>
              </div>
            ))}

            {times.map((time) => (
              <Fragment key={time}>
                <div className="time-label" key={`${time}-label`}>
                  {time}
                </div>
                {days.map(({ isoDate }) => {
                  const slot = slots.find((item) => item.isoDate === isoDate && item.time === time);

                  if (!slot) {
                    return null;
                  }

                  return (
                    <button
                      className={selectedSlotId === slot.id ? 'slot selected' : 'slot'}
                      type="button"
                      key={slot.id}
                      disabled={!slot.available}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setStatus('');
                      }}
                      aria-pressed={selectedSlotId === slot.id}
                    >
                      <span>{slot.available ? `${time} - 1 hr` : 'Busy'}</span>
                      <small>{slot.date}</small>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>

          <div className="contact-panel">
            <label>
              Email or phone number
              <input
                name="reply_to"
                type="text"
                inputMode="email"
                placeholder="you@example.com or (555) 123-4567"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
              />
            </label>
            <label>
              Notes
              <textarea
                name="message"
                placeholder="What would you like to work on?"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">Request lesson</button>
              <a href={mailtoHref}>Email instead</a>
            </div>
            <p className="status" aria-live="polite">
              {status || (selectedSlot ? `Selected: ${selectedSlot.day}, ${selectedSlot.date} at ${selectedSlot.time} for 1 hour` : 'Select an open time slot.')}
            </p>
          </div>
        </form>

        <iframe className="hidden-frame" name="booking-frame" title="Booking submission" />
      </section>
    </main>
  );
}

export default App;
