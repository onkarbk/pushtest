/**
 * Get Date and Time in Day.
 * @param {string | Date} datestring - The JavaScript Date String or Date Object.
 * @returns {string} - The Date and Time in Day, DD Month at HH:MM AM format.
 */

export function getDateAndTime(datestring: string | Date) {
    const date = new Date(datestring);
  
    //Day of Week
    const dayOfWeek = date.getDay();
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const weekday = weekdays[dayOfWeek];
  
    //Date
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = months[monthIndex];
  
    //Time
    const amOrPm = date.getHours() >= 12 ? 'PM' : 'AM';
    const hour = amOrPm === 'PM' ? date.getHours() % 12 : date.getHours();
    const minute = date.getMinutes();
  
    return `${weekday}, ${day} ${month} at ${hour}:${minute} ${amOrPm}`;
  }
