type SpinnerState = {
    frames: string[];
    interval: number;
    timer?: NodeJS.Timeout;
    current: number;
};

export class ProgressTracker {
    private spinner: SpinnerState = {
        frames: ["-", "\\", "|", "/"],
        interval: 80,
        current: 0,
    };

    private message = "";

    start(message: string) {
        this.message = message;
        process.stdout.write(`${message}\n`);
        this.spinner.timer = setInterval(() => {
            const frame = this.spinner.frames[this.spinner.current];
            process.stdout.write(`\r${frame} ${this.message}`);
            this.spinner.current = (this.spinner.current + 1) % this.spinner.frames.length;
        }, this.spinner.interval);
    }

    update(message: string) {
        this.message = message;
        process.stdout.write(`\r${this.message}\n`);
    }

    succeed(message: string) {
        this.stop();
        process.stdout.write(`\r[✓] ${message}\n`);
    }

    fail(message: string) {
        this.stop();
        process.stdout.write(`\r[x] ${message}\n`);
    }

    stop() {
        if (this.spinner.timer) {
            clearInterval(this.spinner.timer);
            this.spinner.timer = undefined;
        }
        process.stdout.write("\r");
    }
}

