import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  currentLine: Number;
  characters: Array<Object> = [];
  scriptLines: Array<Object> = [];

  constructor(private http: HttpClient) {
    this.currentLine = 0;
    this.http.get('assets/script.txt', {responseType: 'text'})
      .subscribe(data => this.readScript(data));
  }

  private parseCharacter( line: String ): Object {
    let fields = line.split("\t");
    let character = {};
    if( fields.length > 1 ) {
      character["charName"] = fields[1];
    }
    if( fields.length > 2 ) {
      const extraFields = this.parseExtraFields( fields, 2 );
      character = {...character, ...extraFields};
    }
    return character;
  }

  private parseLine( line: String ): Object {
    let fields = line.split("\t");
    let scriptLine = {};
    scriptLine["charName"] = fields[0];
    scriptLine["line"] = fields[1];
    if( fields.length > 2 ) {
      const extraFields = this.parseExtraFields( fields, 2 );
      scriptLine = {...scriptLine, ...extraFields};
    }
    return scriptLine;
  }

  private parseExtraFields( fields, start ): Object {
    let result = {};
    fields.splice(0,start);
    for( const field of fields ) {
      if( field.includes(":") ) {
        const values = field.split(":");
        result[values[0].trim().toLowerCase()] = values[1].trim();
      }
    }
    return result;
  }

  private readScript(data): void {
    let section: String = "header";
    for( const line of data.split("\n") ) {
      const lowerLine = line.toLowerCase().trim();
      if( lowerLine === "body" ) {
        section = "body";
      }
      else if( section === "header" ) {
        if( lowerLine.substring(0,9) === "character" ) {
          this.characters.push( this.parseCharacter( line ) );
        }
      }
      else if( section === "body" ) {
        this.scriptLines.push( this.parseLine( line ) );
      }
    }
  }
}
