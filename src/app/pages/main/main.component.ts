import { Component, OnInit } from '@angular/core';
import { ScriptService } from '../../services/script.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  currDialogue: string = "";
  currCharacter: string = "";
  gameRunning: boolean = false;
  charLeftURL: string = "";
  charCenterURL: string = "";
  charRightURL: string = "";
  backgroundURL: string = "";
  
  constructor(private scriptService: ScriptService) {}

  ngOnInit() {
    this.updateUI();
  }

  startGame() {
    this.gameRunning = true;
    this.updateUI();
  }

  nextDialogueLine() {
    this.scriptService.advanceDialogue();
    this.updateUI();
  }

  previousDialogueLine() {
    this.scriptService.previousDialogue();
    this.updateUI();
  }

  updateUI() {
    this.scriptService.currentDialogue().subscribe( line => this.currDialogue = line );
    this.scriptService.currentCharacter().subscribe( char => this.currCharacter = char );
    this.scriptService.getImageURL("left").subscribe( char => this.charLeftURL = char );
    this.scriptService.getImageURL("center").subscribe( char => this.charCenterURL = char );
    this.scriptService.getImageURL("right").subscribe( char => this.charRightURL = char );
    this.scriptService.getImageURL("bg").subscribe( img => this.backgroundURL = img );
  }

}
