import { Injectable } from '@angular/core';

export interface IsoWeekRange {
  start: Date;
  end: Date;
}

@Injectable({ providedIn: 'root' })
export class DateFunctionsService {
  getIsoWeekRange(year: number, week: number): IsoWeekRange {
    const reference = new Date(Date.UTC(year, 0, 4));
    const referenceWeekday = reference.getUTCDay() || 7;
    const start = new Date(reference);
    start.setUTCDate(reference.getUTCDate() - (referenceWeekday - 1) + (week - 1) * 7);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    return { start, end };
  }

  getIsoWeeksInYear(year: number): number {
    const reference = new Date(Date.UTC(year, 11, 28));
    const { week } = this.getIsoWeekNumber(reference);
    return week;
  }

  getIsoWeekNumber(date: Date): { week: number; year: number } {
    const temp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const weekday = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - weekday);

    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const diffMilliseconds = temp.getTime() - yearStart.getTime();
    const week = Math.ceil((diffMilliseconds / 86400000 + 1) / 7);

    return { week, year: temp.getUTCFullYear() };
  }

  formatDateDDMMYY(date: Date): string {
    const day = this.padNumber(date.getUTCDate());
    const month = this.padNumber(date.getUTCMonth() + 1);
    const year = this.padNumber(date.getUTCFullYear() % 100);
    return `${day}-${month}-${year}`;
  }

  private padNumber(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
