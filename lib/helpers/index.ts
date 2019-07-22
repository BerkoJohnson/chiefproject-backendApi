export function generateIDs(type: string, id = 'ERC-T2019-0000') {
  // Generate ids for new teachers eg. ERC-T2019001
  const year = new Date().getFullYear();

  const nextTNO = (+id.split('-')[2] + 1).toString();
  let nextIDPart;
  if (nextTNO.length === 1) {
    nextIDPart = '0'.repeat(4 - nextTNO.length) + nextTNO;
  } else if (nextTNO.length === 2) {
    nextIDPart = '0'.repeat(4 - nextTNO.length) + nextTNO;
  } else if (nextTNO.length === 3) {
    nextIDPart = '0'.repeat(4 - nextTNO.length) + nextTNO;
  } else if (nextTNO.length === 4) {
    nextIDPart = '0'.repeat(4 - nextTNO.length) + nextTNO;
  }

  let idType = type === 'Teacher' ? 'T' : 'S';

  return `ERC-${idType}${year}-${nextIDPart}`;
}

// Get the lesson status, whether over or in progress or not started
export function getLessonStatus(lessonTime: string) {
  let status = '';

  const oneHourInMinutes = 60 * 60 + 30;
  const timeInMinutes =
    +lessonTime.split(':')[0] * 60 * 60 + +lessonTime.split(':')[1];
  const currentMinutes =
    new Date().getHours() * 60 * 60 + new Date().getMinutes();

  if (currentMinutes < timeInMinutes) {
    status = 'Not Started';
  } else if (
    currentMinutes > timeInMinutes &&
    currentMinutes < timeInMinutes + oneHourInMinutes
  ) {
    status = 'In Progress';
  } else {
    status = 'Over';
  }
  return status;
}
