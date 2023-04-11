import { Types } from './../../types';
import { Component, OnInit } from '@angular/core';
import { ApiService, Final24 } from '../../services/api.service';
import CeaJson from '../../cea.json';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';
import { Router } from '@angular/router';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {

  analysisTypeID: number;
  analysis1: number = 10;
  analysis2: number = 11;
  type: number = 1;
  sortType: number = 1;
  viewType: number = 1;
  summType: number = 1;
  tableShow = false;  //show table view by default
  graphShow = true;
  fullShow = false;  //show full view by default, not compare
  compareShow = true;
  detailShow = false; //show analysis types, not summary
  summaryShow = true;
  focusTeam: string;
  display: number;
  typeGroup: number;
  mode: number;
  holdView: number;
  access: number = 0;

  //apiAnalysis: CEA[] = [];
  apiFinal24List: Final24[] = [];
  apiTypes: Types[] = [];
  apiDnpList: Final24[] = [];
  apiPickList: Final24[] = [];
  apiWatch1List: Final24[] = [];
  apiWatch2List: Final24[] = [];
  compareList: Final24[]=[{ team: "" },{ team: "" },{ team: "" },{ team: "" },{ team: "" },{ team: "" },{ team: "" },{ team: "" }];

  filterList: Final24[]=[];
  filter: number = 0;
  pageFilter: number = 0;
  dnpfilter: number = 0;
  holdViewDNP: number = 1;

  constructor(public apiService: ApiService, private formBuilder: FormBuilder, private router: Router) {
    //this.apiService.CEAReplay.subscribe((analysis) => (this.apiAnalysis = analysis));
    //this.apiService.Final24Replay.subscribe((final24) => (this.apiFinal24List = final24));
    this.apiFinal24List = [new Final24()];
    this.analysisTypeID = 1;
    this.focusTeam = "";
    this.display = 1;
    this.typeGroup = 1;
    this.mode = 1;
    this.holdView = 1;

    console.log("final24",this.apiFinal24List);
    
  }

  ngOnInit(): void  {

    // Verify User has access for this page.
    this.access = Number(localStorage.getItem('access')) || -1;

    if(this.access < 4) {
      this.router.navigate(["login/"]); 
    } else {


      // we will initialize our form here
      this.apiService.TypesReplay.subscribe(types => { 
        this.apiTypes = types; 
      
        // Sort Analysis Types by teamPicker value
        this.apiTypes.sort((a, b) => a.teamPicker - b.teamPicker);
      
      });



      this.apiService.getDnp().then(response => this.apiDnpList = response);

      this.apiService.getFinal24().then(response => this.apiFinal24List = response);

      this.apiService.getPick().then(response => this.apiPickList = response);

      this.apiService.getWatch1().then(response => this.apiWatch1List = response);
      this.apiService.getWatch2().then(response => this.apiWatch2List = response);

      this.filterList = this.apiFinal24List.concat(this.apiDnpList);
      this.filter = 0;

      this.teamSelectionChange(1);
      console.log("final24",this.apiFinal24List);

    }

  }

  teamSelectionChange(list: number) {
    // Angular won't detect changes inside an array - so set the array to a new array to force the change detection to fire
    if (list == 1) {
      this.apiFinal24List = this.apiFinal24List.slice();
    }
    else if (list == 2) {
      this.apiDnpList = this.apiDnpList.slice();
    }
    else if (list == 3) {
      this.apiPickList = this.apiPickList.slice();
    }

    console.log("Change IDentified");
    // Logic to turn filter back off
    if (this.filter == 0) {
      this.filterList = this.apiFinal24List.concat(this.apiDnpList);
    } else {
      this.filterList = this.compareList;
    }
    
  }

  addEnd(list: number) {
    if (list == 1) {
      this.apiFinal24List.splice(this.apiFinal24List.length, 0, new Final24());
    }
    else if (list == 2) {
      this.apiDnpList.splice(this.apiDnpList.length, 0, new Final24());
    }
    else if (list == 3) {
      this.apiPickList.splice(this.apiPickList.length, 0, new Final24());
    }

  }

  processDoubleClick(index: number){
    if (this.apiFinal24List.length == 1){
      this.apiFinal24List.splice(index, 0, new Final24());
    }
    else if (this.apiFinal24List[index].team === '') {
      if (this.apiFinal24List.length > 1) {
        this.apiFinal24List.splice(index, 1);
      }
    } else {
      this.apiFinal24List.splice(index, 0, new Final24());
    }
  }

  processDoubleClickDnp(index: number){
    if (this.apiDnpList.length == 1){
      this.apiDnpList.splice(index, 0, new Final24());
    }
    else if (this.apiDnpList[index].team === '') {
      if (this.apiDnpList.length > 1) {
        this.apiDnpList.splice(index, 1);
      }
    } else {
      this.apiDnpList.splice(index, 0, new Final24());
    }
  }

  processDoubleClickPick(index: number){
    if (this.apiPickList.length == 1){
      this.apiPickList.splice(index, 0, new Final24());
    }
    else if (this.apiPickList[index].team === '') {
      if (this.apiPickList.length > 1) {
        this.apiPickList.splice(index, 1);
      }
    } else {
      this.apiPickList.splice(index, 0, new Final24());
    }
  }

  select(type: number, analysis: number) {
    if (type == 1) {
      this.analysis1 = analysis;
    } else {
      this.analysis2 = analysis;
    }

  }

  compareTeams(): void {
    
    if (this.filter == 0 ) {
  
      this.filterList = this.compareList;
      this.filter = 1;
      this.focusTeam = "";
      this.gridView(5);    // Turn on 8 Table Grid Display
      this.holdView = this.viewType;
      //this.viewType = 2;  // Turn on Graph View for other Buttons

    } else {
      // Logic to turn filter back off
      //this.filterList = this.apiFinal24List;
      this.filterList = this.apiFinal24List.concat(this.apiDnpList);
      this.filter = 0;
      this.viewType = this.holdView;  // Set viewtype back to original setting
      this.normalView();
      this.pageFilter = 1;
    }

    this.compareShow = !this.compareShow;
    this.fullShow = !this.fullShow;
 }

 compareDnp(): void {
    
  if (this.filter == 0 ) {

    this.filterList = this.apiDnpList;
    console.log("DNP List: ", this.apiDnpList);
    this.filter = 1;  // turn off compare if it's on
    this.focusTeam = "";
    this.gridView(5);    // Turn on 8 Table Grid Display
    this.holdView = this.viewType;
    //this.viewType = 2;  // Turn on Graph View for other Buttons

  } else {
    // Logic to turn filter back off
    //this.filterList = this.apiFinal24List;
    this.filterList = this.apiFinal24List.concat(this.apiDnpList);
    this.filter = 0;
    this.viewType = this.holdView;  // Set viewtype back to original setting
    this.normalView();
    this.pageFilter = 1;
  }

  this.compareShow = !this.compareShow;
  this.fullShow = !this.fullShow;
}







  // Deteremine the Analysis Types to send to the team-table component
  changeDisplay(type: number) {
    //console.log("Display Type: " + type)
    this.typeGroup = type;

    if (type == 1) {
      this.analysis1 = 2;
      this.analysis2 = 4;
    } else if (type == 2) {
      this.analysis1 = 2;
      this.analysis2 = 15;
    } else if (type == 3) {
      this.analysis1 = 11;
      this.analysis2 = 8;
    } else if (type == 4) {
      this.analysis1 = 8;
      this.analysis2 = 15;
    } else if (type == 5) {
      this.analysis1 = 11;
      this.analysis2 = 12;
    } else if (type == 6) {
      this.analysis1 = 8;
      this.analysis2 = 13;
    } else {
       this.analysis1 = 10;
       this.analysis2 = 11;
    }
    //Turn off Summary Show when Other top buttons are selected
    this.summaryShow = true;
    this.detailShow = false;

    this.normalView();
  }

  changeSort(type: number) {

    //console.log("Sort Type: " + type)
    if (type == 1) {
      this.sortType = 2;
    } else {
      this.sortType = 1;
    }
  }

  summaryView() {
    this.summaryShow = false;
    this.detailShow = true;
    if (this.viewType == 1) {this.display = 3 } else {this.display = 4}
  }

  normalView() {
    if (this.viewType == 1) {
      this.display = 1 
    } else {
      if (this.filter == 1) {
        this.display = 6
      } else {
        this.display = 2
      }
    }
  }


  gridView(num:number) {
    this.display = num;

  }


  allianceView() {
    this.display = 7;
  }

  changeView(view: number) {

    //console.log("View Type: " + view)
    if (view == 1) {
      this.viewType = 2;
    } else {
      this.viewType = 1;
    }
    this.graphShow = !this.graphShow;
    this.tableShow = !this.tableShow;

    if ((this.display == 3) || (this.display == 4)) {
      this.summaryView();
    } else {
      this.normalView();
    }


    //console.log("Graph: " + this.graphShow + " Table: " + this.tableShow);
  }


  listRecipients() {
    console.log("Hello!");
  }

  save() {
    var pass = prompt("Password Required to save to Database");

    if(pass == '999') {
      // call API to save Team Selection Data
      alert("Access Approved");
      this.apiService.saveFinal24(this.apiFinal24List);
      this.apiService.saveDnp(this.apiDnpList);
      this.apiService.savePick(this.apiPickList);
      this.apiService.saveWatch1(this.apiWatch1List);
      this.apiService.saveWatch2(this.apiWatch2List);

    } else {
      alert("ERROR: Invalid Password");
    }

  }

  copyToPick() {
    this.apiPickList = [];
    this.apiPickList = JSON.parse(JSON.stringify(this.apiFinal24List))
  }

  copyToFinal() {
    this.apiFinal24List = [];
    this.apiFinal24List = JSON.parse(JSON.stringify(this.apiPickList))
    this.teamSelectionChange(1);
  }

  copyToComp(list: number) {
    if (list == 1) {
      this.compareList = [];
      this.compareList = JSON.parse(JSON.stringify(this.apiWatch1List));
    } else if (list == 2) {
      this.compareList = [];
      this.compareList = JSON.parse(JSON.stringify(this.apiWatch2List));
    }

  }
  
  copyToWatch(list: number) {
    if (list == 1) {
      this.apiWatch1List = [];
      this.apiWatch1List = JSON.parse(JSON.stringify(this.compareList));
    } else if (list == 2) {
      this.apiWatch2List = [];
      this.apiWatch2List = JSON.parse(JSON.stringify(this.compareList));
    }
    
  }

  clearFinal24() {
    for (const t of this.apiFinal24List)  {
      t.team = "";
    }
    this.teamSelectionChange(1);
  }

  onChanges(): void {

    console.log("Change IDentified");
  }

  print_team(team: string) {
    //console.log("Team Passed back from Child: " + team);
    this.focusTeam = team;
  }
  
  getClass(team: string) {
    //return 'tbox';
    if (this.mode == 3) {
      for (const t of this.apiFinal24List) {
        if (team == t.team && t.team != "") {
          console.log("Matched: " + team);
          return 'selected';  
        }
      }
    }
    return 'tbox';
  }

  filterChange() {
    if (this.filter == 1) {
      alert("Filter Feature not Available when Compare is on");
    } else {
      if (this.pageFilter == 0) {
        //this.teamSelectionChange(1);
        this.filterList = this.apiFinal24List.concat(this.apiDnpList);
        this.pageFilter = 1;
      }
      else {
        this.filterList = [{ team: "" }];
        this.pageFilter = 0;
      }

    }

    
  }

}
