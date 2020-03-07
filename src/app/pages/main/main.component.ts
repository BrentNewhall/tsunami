import { Component, OnInit } from '@angular/core';
import { ScriptService } from '../../services/script.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  currDialogue: String;

  constructor(private scriptService: ScriptService) { }

  ngOnInit() {
    this.updateUI();
  }

  startGame() {
    this.updateUI();
  }

  updateUI() {
    this.scriptService.currentDialogue().subscribe( line => this.currDialogue = line );
  }

}
