import { Injectable } from '@nestjs/common';

@Injectable()
export class TimestampService {
  parse(line: string): Date | null {
    const timestampMatch = line.match(/(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/);

    if (timestampMatch) {
      const [day, month, year, hour, minute, second] = timestampMatch[1].split(/[/ :]/).map(Number);
      return new Date(year, month - 1, day, hour, minute, second);

    }

    return null;
  }
}
