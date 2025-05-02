import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector, private ngZone: NgZone) {}

    handleError(error: any): void {
        const router = this.injector.get(Router);
        this.ngZone.run(() => {
            // Navigate to the error page
            router.navigate(['/error']);
        });

        // Log the error to the console or send it to a server
        console.error('An error occurred:', error);
    }
}
