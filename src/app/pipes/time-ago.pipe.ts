import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    pure: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(dateString: string | null): string {

        let result: string;

        // Tranforming from String to Date format
        const dateValue: Date = new Date(dateString);

        // current time
        const now = new Date().getTime();

        // time since transaction was made in seconds
        const delta = (now - dateValue.getTime()) / 1000;

        console.log ('dateString ', dateString);

        // If transaction has just been broadcasted then dateString will be null in the first few seconds (prevalidation stage)
        if (delta < 20 || (dateString === null)) {
            console.log ('dateString in the if', dateString);
            return 'just now';
        }

        // Return interval format in seconds, hours or days
        if (delta < 60) {  // Sent in last minute
            result = Math.floor(delta) + ' sec ';
        } else if (delta < 3600) {  // Sent in last hour: 1h = 3600 sec -> displays seconds
            result = Math.floor(delta / 60) + ' mn ';

            // Adds seconds details if there's a remainder in 'delta % 60'
            if (Math.floor(delta % 60) !== 0) {
                result = result + Math.floor(delta % 60) + ' sec ';
            }
        } else if (delta < 86400) {  // Sent on last day: 1d = 86400 sec -> displays hours and seconds
            result = String(Math.floor(delta / 3600));

            // Adds suffix hr or hrs depending on 'delta / 3600' value
            result = Math.floor(delta / 3600) > 1 ? result + ' hrs ' : result + ' hr ';

            // Adds minutes details if there's a remainder in 'delta % 3600'
            if (Math.floor(delta % 3600) !== 0) {
                result = result + Math.floor((delta % 3600) / 60) + ' mn ';
            }
        } else if (delta < 2592000) {  // Sent on last month: 1m = 2592000 sec (30 days) -> displays days and hours
            result = String(Math.floor(delta / 86400));

            // Adds suffix day or days depending on 'delta / 86400' value
            result = Math.floor(delta / 86400) > 1 ? result + ' days ' : result + ' day ';

            // Adds hours details if there's a remainder in 'delta % 86400'
            if (Math.floor(delta % 86400) !== 0) {
                result = result + String(Math.floor((delta % 86400) / 3600));

                // Adds suffix hr or hrs depending on '(delta % 86400) / 3600' value
                result = Math.floor((delta % 86400) / 3600) > 1 ? result + ' hrs ' : result + ' hr ';
            }
        } else if (delta < 31536000) {  // Sent on last year: 1y = 31536000 sec (365 days) -> displays months and days
            result = String(Math.floor(delta / 2592000));

            // Adds suffix month or months depending on 'delta / 2592000' value
            result = Math.floor(delta / 2592000) > 1 ? result + ' months ' : result + ' month ';

            // Adds days details if there's a remainder in 'delta / 2592000'
            if (Math.floor(delta % 2592000) !== 0) {
                result = result + String(Math.floor((delta % 2592000) / 86400));

                // Adds suffix day or days depending on '(delta % 2592000) / 86400' value
                result = Math.floor((delta % 2592000) / 86400) > 1 ? result + ' days ' : result + ' day ';
            }

        } else {  // Sent more than one year ago -> displays years and months
            result = String(Math.floor(delta / 31536000));

            // Adds suffix year or years depending on 'delta / 31536000' value
            result = Math.floor(delta / 31536000) > 1 ? result + ' years ' : result + ' year ';

            // Adds months details if there's a remainder in 'delta / 31536000'
            if (Math.floor(delta % 31536000) !== 0) {
                result = result + String(Math.floor((delta % 31536000) / 2592000));

                // Adds suffix month or months depending on '(delta % 31536000) / 2592000' value
                result = Math.floor((delta % 31536000) / 2592000) > 1 ? result + ' months ' : result + ' month ';
            }

        }

        return result + 'ago';
    }
}
