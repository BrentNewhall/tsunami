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
  readScript(data): void {
    let section: String = "header";
    for( const line of data.split("\n") ) {
      const lowerLine = line.toLowerCase().trim();
      if( lowerLine === "body" ) {
        section = "body";
      }
      else if( section === "header" ) {
        if( lowerLine.substring(0,9) === "character" ) {
          let fields = line.split("\t");
          let character = {};
          if( fields.length > 1 ) {
            character["charName"] = fields[1];
          }
          if( fields.length > 2 ) {
            fields.splice(0,2);
            for( const field of fields ) {
              const values = field.split(":");
              character[values[0].trim().toLowerCase()] = values[1].trim();
            }
          }
          this.characters.push( character );
        }
      }
      else if( section === "body" ) {
        let fields = line.split("\t");
        let scriptLine = {};
        scriptLine["charName"] = fields[0];
        scriptLine["line"] = fields[1];
        this.scriptLines.push( scriptLine );
      }
      console.log( section, `"${lowerLine}"` );
    }
    console.log( "Characters", this.characters );
    console.log( "Lines:", this.scriptLines );
  }
}
