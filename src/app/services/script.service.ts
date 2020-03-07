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
  backgroundImage: String = "";

  constructor(private http: HttpClient) {
    this.currentLine = 0;
    this.http.get('assets/script.txt', {responseType: 'text'})
      .subscribe(data => this.readScript(data));
  }

  public currentDialogue(): Observable<string> {
    if( this.scriptLines.length > 0 ) {
      return of(this.scriptLines[this.currentLine]["line"]);
    }
    return of("THE END");
  }

  public currentCharacter(): Observable<string> {
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

  public getBackgroundURL(): Observable<String> {
    return of(this.backgroundImage);
  }

  public advanceDialogue(): void {
    if( this.currentLine < this.scriptLines.length - 1 ) {
      this.currentLine++;
      this.setupImages();
    }
  }

  public previousDialogue(): void {
    if( this.currentLine > 0 ) {
      this.currentLine--;
      this.setupImages();
    }
  }

  private setupImages(): void {
    const line = this.scriptLines[this.currentLine];
    this.charImageLeft = "";
    this.charImageRight = "";
    if( "charleft" in line ) {
      this.charImageLeft = this.getImage( "charleft", "characters", line );
    }
    if( "charright" in line ) {
      this.charImageRight = this.getImage( "charright", "characters", line );
    }
    if( "bg" in line ) {
      this.backgroundImage = this.getImage( "bg", "backgrounds", line );
    }
  }

  private getImage( name: string, type: string, line: object ): string {
    let result = "";
    if( name in line ) {
      result = line[name];
      if( ! result.includes("-") ) {
        result += "-neutral";
      }
      result += ".png";
    }
    return "assets/" + type + "/" + result;
  }

  private readScript( data: string ): void {
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
        if( line[0] !== "#" ) {
          const parsedLine = this.parseLine( line );
          if( Object.keys(parsedLine).length !== 0 ) {
            this.scriptLines.push( parsedLine );
          }
        }
      }
    }
    this.setupImages();
  }

  private parseCharacter( line: string ): object {
    let fields = line.split("|").map( f => f.trim() );
    let character = {};
    if( fields.length > 1 ) {
      character["charName"] = fields[1].toLowerCase();
    }
    if( fields.length > 2 ) {
      const extraFields = this.parseExtraFields( fields, 2 );
      character = {...character, ...extraFields};
    }
    return character;
  }

  private parseLine( line: string ): object {
    if( ! line.includes("|") ) {
      return {};
    }
    let fields = line.split("|").map( f => f.trim() );
    let scriptLine = {};
    scriptLine["charName"] = fields[0].toLowerCase();
    scriptLine["line"] = fields[1];
    if( fields.length > 2 ) {
      const extraFields = this.parseExtraFields( fields, 2 );
      scriptLine = {...scriptLine, ...extraFields};
    }
    return scriptLine;
  }

  private parseExtraFields( fields: Array<string>, start: number ): Object {
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
}
