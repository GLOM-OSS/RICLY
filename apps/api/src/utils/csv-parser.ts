import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ERR05 } from '../exception';

// Read and process the CSV file
export async function readAndProcessFile<T>(
  columns: string[],
  csvStream: Readable
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
      if (records.length === 0) {
        const csvHasCorrectHead = Object.keys(record).reduce(
          (hasCorrectHead, key) => hasCorrectHead && key === record[key],
          true
        );
        if (!csvHasCorrectHead)
          throw new Error(
            JSON.stringify(ERR05(`{${Object.keys(record)}}`, `{${columns}}`))
          );
      } 
      records.push(record);
    }
  });
  await finished(parser);
  return records.slice(1);
}
