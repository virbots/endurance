/*******************************************************************************
 *  Name:    Kevin Wayne, made Object-Oriented by Ed Larmore
 *  8/19/21 Translated from java to ts
 ******************************************************************************/
export class EnduranceEntry {
    id:number;
    name:string;
    stroke:string;
    date:string; // number;
    pace:string; // number;
    time:string; // number;
    note:string;

    constructor(id: number, name: string, date:string, stroke:string, pace:string, time:string, note:string) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.stroke = stroke;
        this.pace = pace;
        this.time = time;
        this.note = note;
    }

    blob():object {
        return {id: this.id, name: this.name, stroke: this.stroke, date: this.date, pace: this.pace, time: this.time, note: this.note}
    }
}

export class AgeGroup {
    gender:string;
    ageBracket:string;

    constructor(gender:string, ageBracket:string) {
        this.gender = gender;
        this.ageBracket = ageBracket;
    }

    getTabName():string {
        let gen;
        switch(this.gender) {
            case 'F':
                gen = 'Girls';
                break;
            case 'M':
                gen = 'Boys';
                break;
            default:
                gen = 'Unknown';
        }
        return `${this.ageBracket} ${gen}`;
    }
}

export class TimeStandard {
    ageGroup:AgeGroup;
    distance:number;
    stroke:string;
    standard:string;
    time:string;
    status:number;
    shown:boolean;

    constructor(gender:string, ageBracket:string, distance:number, stroke:string, standard:string, time:string) {
        this.ageGroup = new AgeGroup(gender, ageBracket);
        this.distance = distance; // 50 (in yards)
        this.stroke = stroke; // Breast, Free, etc
        this.standard = standard; // B, BB, A, AA, etc
        this.time = time; // 1:29.59
        this.status = 0;
        this.shown = false; // until otherwise set
    }

    toRow():string {
        return `<tr>
                    <td>${this.distance} Y ${this.stroke}</td>
                    <td>${this.standard}</td>
                    <td>${this.time} sec</td>
                </tr>`;
    }

    toNiceStatus():string {
        if (this.status < 100) {
            return `${this.status.toFixed(1)}%`;
        }
        return '&#x2705;' // checkmark
    }
}

export class Swimmer {
    name:string;
    ageGroup:AgeGroup;

    constructor(name: string, gender:string, ageBracket:string) {
        this.name = name;
        this.ageGroup = new AgeGroup(gender, ageBracket);
    }

    ageBracket():string {
        return this.ageGroup.ageBracket;
    }

    gender():string {
        return this.ageGroup.gender;
    }

/*
    blob():object {
        return {name: this.name, gender: this.gender(), ageBracket: this.ageBracket()}
    }
*/
}
