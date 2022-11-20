import * as fs from 'fs';
import { parse } from 'csv-parse';
import { finished } from 'stream/promises';

// Read and process the CSV file
export async function readAndProcessFile<T>(
  columns: string[],
  csvStream: fs.ReadStream
) {
  const records: T[] = [];
  const parser = csvStream.pipe(
    parse({
      cast: true,
      skip_empty_lines: false,
      columns: columns.map((column) => ({ name: column })),
    })
  );
  parser.on('readable', function () {
    let record: T;
    while ((record = parser.read()) !== null) {
      // Work with each record
      records.push(record);
    }
  });
  await finished(parser);
  return records;
}
