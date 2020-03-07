import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  currentLine = 0;
  characters: Array<Object> = [];
  scriptLines: Array<Object> = [];
  charImageLeft: String = "";
  charImageRight: String = "";

  constructor(private http: HttpClient) {
    this.currentLine = 0;
    this.http.get('assets/script.txt', {responseType: 'text'})
      .subscribe(data => this.readScript(data));
  }

  public currentDialogue(): Observable<String> {
    if( this.scriptLines.length > 0 ) {
      return of(this.scriptLines[this.currentLine]["line"]);
    }
    return of("THE END");
  }

  public currentCharacter(): Observable<String> {
    if( this.scriptLines.length > 0 ) {
      const charName = this.scriptLines[this.currentLine]["charName"];
      let charFullName = "";
      if( charName !== "" ) {
        charFullName = this.characters.find( obj => obj["charName"] === charName )["name"];
      }
      return of(charFullName);
    }
    return of("THE END");
  }

  public getLeftCharacterURL(): Observable<String> {
    return of(this.charImageLeft);
  }

  public getRightCharacterURL(): Observable<String> {
    return of(this.charImageRight);
  }

  public advanceDialogue(): void {
    if( this.currentLine < this.scriptLines.length - 1 ) {
      this.currentLine++;
      this.setupCharImages();
    }
  }

  public previousDialogue(): void {
    if( this.currentLine > 0 ) {
      this.currentLine--;
      this.setupCharImages();
    }
  }

  private setupCharImages(): void {
    const line = this.scriptLines[this.currentLine];
    this.charImageLeft = "";
    this.charImageRight = "";
    if( "charleft" in line ) {
      this.charImageLeft = this.getCharImage( "charleft", line );
    }
    if( "charright" in line ) {
      this.charImageRight = this.getCharImage( "charright", line );
    }
  }

  private getCharImage( name, line ) {
    let result = "";
    if( name in line ) {
      result = line[name];
      if( ! result.includes("-") ) {
        result += "-neutral";
      }
      result += ".png";
    }
    return "assets/characters/" + result;
  }

  private parseCharacter( line: String ): Object {
    let fields = line.split("|").map( f => f.trim() );
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
    let fields = line.split("|").map( f => f.trim() );
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
        const values = field.split(":").map( f => f.trim() );
        result[values[0].toLowerCase()] = values[1];
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
    this.setupCharImages();
  }
}
