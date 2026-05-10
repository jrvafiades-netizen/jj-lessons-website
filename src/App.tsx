import { Fragment, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import lessonHero from './assets/lesson-hero.png';

type TimeSlot = {
  id: string;
  day: string;
  date: string;
  time: string;
  available: boolean;
};

const recipientEmail = 'jrvafiades@gmail.com';

const days = [
  { day: 'Sun', date: 'May 10' },
  { day: 'Mon', date: 'May 11' },
  { day: 'Tue', date: 'May 12' },
  { day: 'Wed', date: 'May 13' },
  { day: 'Thu', date: 'May 14' },
  { day: 'Fri', date: 'May 15' },
  { day: 'Sat', date: 'May 16' },
];

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

function App() {
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const slots = useMemo<TimeSlot[]>(
    () =>
      days.flatMap(({ day, date }) =>
        times.map((time) => {
          const id = `${day}-${time}`;

          return {
            id,
            day,
            date,
            time,
            available: !unavailableSlots.has(id),
          };
        }),
      ),
    [],
  );

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
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

  return (
    <main className="page-shell">
      <section className="intro">
        <img className="intro-image" src={lessonHero} alt="A bright teaching desk with a calendar and lesson notes" />
        <div className="intro-copy">
          <p className="eyebrow">Private lessons</p>
          <h1>Focused lessons built around your pace.</h1>
          <p>
            Book a one-on-one session for thoughtful instruction, clear practice goals, and a steady path from
            where you are now to the next thing you want to learn.
          </p>
        </div>
      </section>

      <section className="booking" aria-labelledby="booking-title">
        <div className="booking-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2 id="booking-title">book a lesson today</h2>
          </div>
          <div className="calendar-controls" aria-label="Calendar navigation">
            <button type="button" aria-label="Previous week">
              ‹
            </button>
            <button type="button" aria-label="Next week">
              ›
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
            {days.map(({ day, date }) => (
              <div className="day-heading" key={day} role="columnheader">
                <span>{day}</span>
                <strong>{date}</strong>
              </div>
            ))}

            {times.map((time) => (
              <Fragment key={time}>
                <div className="time-label" key={`${time}-label`}>
                  {time}
                </div>
                {days.map(({ day, date }) => {
                  const slot = slots.find((item) => item.day === day && item.time === time);

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
                      <small>{date}</small>
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
