import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { userObj } from './app.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true} }]
})

export class AppComponent implements OnInit {
  title = 'user_fa_angular';
  customClass = 'customClass';
  bsValue = new Date();
  modalRef: BsModalRef;
  @ViewChild('template') template : any;
  selectedValue: string;

  constructor(private modalService: BsModalService) {
  }

  ngOnInit(): void {
    this.showAllUser();

    $("#selectSearch").on("change", () => {
      $("#search").val("").trigger("change");
      $("#searchDate").val("").trigger("change");

      if($("#selectSearch").val() == "birthday" || $("#selectSearch").val() == "dateSave"){
        var searchDate = document.getElementById("searchDate") as HTMLInputElement;
        searchDate.type = "text";
        var search = document.getElementById("search") as HTMLInputElement;
        search.type = "hidden";
      }
      else {
        var searchDate = document.getElementById("searchDate") as HTMLInputElement;
        searchDate.type = "hidden";
        var search = document.getElementById("search") as HTMLInputElement;
        search.type = "text";
      }
    });

    this.search();
  }

  getIdOnClick(data: any): void {
    $("#keep").data("id", data.id);
  }
  
  openModal() {
    this.modalRef = this.modalService.show(this.template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  onDayChange(day: Date) {
    var datepipe = new DatePipe('en-US');
    var formattedDate = datepipe.transform(day, 'dd/MM/YYYY');
    var age = this.calAge(formattedDate)!;
    $("#age").val(age);
  }

  onSearchDayChange(day: Date) {
    var result;
    var datepipe = new DatePipe('en-US');
    var formattedDate = datepipe.transform(day, 'YYYY-MM-dd');
    if($("#selectSearch").val() == "birthday" && formattedDate != ""){
      var url = "/factrl/searchByBirthday?birthday=" + formattedDate;
      result = this.callAjaxService(url, null, "GET");
      this.userTable(result);
    }
    else if($("#selectSearch").val() == "dateSave" && formattedDate != ""){
      var url = "/factrl/searchByDateSave?dateSave=" + formattedDate;
      result = this.callAjaxService(url, null, "GET");
      this.userTable(result);
    }
  }

  dateYMD_To_DMY(date : string){
    var arrayDate = date.split("-");
    arrayDate[0] = parseInt(arrayDate[0]) + 543 as unknown as string;
    date = arrayDate[2]+"-"+arrayDate[1]+"-"+arrayDate[0];
    return date;
  }

  calAge(birthday : any){
    var url = "/factrl/calAge?birthday=" + birthday;
    var age = this.callAjaxService(url, null, "GET");
    return age;
  }
  
  setMode(mode: string){
    if (mode == "add") {
      this.clear();
      $("#keep").data("mode","add");
      this.openModal();
    }
    if (mode == "edit") {
      $("#keep").data("mode","edit");
      this.pickUser();
    }
  }

  checkAddOrEdit(){
    if ($("#keep").data("mode") == "add") {
      this.addUser();
    }
    if ($("#keep").data("mode") == "edit") {
      this.editUser();
    }
  }

  addUser(){
    var user = new userObj();
    user.firstName = $("#firstname").val();
    user.lastName = $("#lastname").val();
    user.birthday = $("#birthday").val();
    var age = this.calAge($("#birthday").val());
    user.age = age;
    user.sex = this.selectedValue;
    user.saveBy = "train6";
      
    if($("#firstname").val() == "" || $("#lastname").val() == "" || $("#birthday").val() == "" || this.selectedValue == "") {
      window.confirm("Please fill up all fields")
    }
    else {
      this.callAjaxService("/factrl/addUser", user, "POST");
      this.showAllUser();
      this.closeModal()
      this.clear();
    }
  }

  pickUser(){
    var id = $("#keep").data("id");
    var param = "?id=" + id;
    var url = "/factrl/searchByIdJPA" + param;
    var result = this.callAjaxService(url, null, "GET");
    
    this.openModal();
    $("#firstname").val(result.firstName);
    $("#lastname").val(result.lastName);
    var birthday = result.birthday;
    this.bsValue = new Date(birthday);
    this.selectedValue = result.sex;
  }

  editUser(){	
    var id = $("#keep").data("id");
    var user = new userObj();
    user.id = id;
    user.firstName = $("#firstname").val();
    user.lastName = $("#lastname").val();
    user.birthday = $("#birthday").val();
    var age = this.calAge($("#birthday").val());
    user.age = age;
    user.sex = this.selectedValue;
    user.saveBy = "train6";
      
    if($("#firstname").val() == "" || $("#lastname").val() == "" || $("#birthday").val() == "" || $("#sex").val() == "") {
      window.confirm("Please fill up all fields");
    }
    else {
      var param = "?id=" + id;
      var url = "/factrl/editUser" + param;
      this.callAjaxService(url, user, "POST");
      this.showAllUser()
          
      this.closeModal()
      this.clear();
    }
  }

  delUser(){
    var id = $("#keep").data("id");
    if (window.confirm("Are you sure you want to delete this user?")){
      var param = "?id=" + id;
      var url = "/factrl/deleteById" + param;
      this.callAjaxService(url, "", "DELETE");
      this.showAllUser();
    }
  }

  clear(){
    this.selectedValue = "";
    this.bsValue = new Date();
    // $(".modal-body input").val("");
  }

  showAllUser(){
    var result = this.callAjaxService("/factrl/getAll", null, "GET");
    this.userTable(result);
  }

  search(){
    var result;
    $("#search").on("change keyup", () => {
      var text = $("#search").val() as string;
      text = text.toLowerCase();
      if (text == "") {
        this.showAllUser();
      }
      if ($("#selectSearch").val() == "id" && text != ""){
        if (Number.isNaN(Number(text))) {
          this.userTable([]);
        }
        else {
          var url = "/factrl/searchByIdJDBC?id=" + text;
          result = this.callAjaxService(url, null, "GET");
          this.userTable(result);
        }
      }
      else if($("#selectSearch").val() == "firstName" && text != ""){
        var url = "/factrl/searchByFirstName?firstName=" + text;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
      else if($("#selectSearch").val() == "lastName" && text != ""){
        var url = "/factrl/searchByLastName?lastName=" + text;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
      else if($("#selectSearch").val() == "age" && text != ""){
        if (Number.isNaN(Number(text))) {
          this.userTable([]);
        }
        else {
          var url = "/factrl/searchByAge?age=" + text;
          result = this.callAjaxService(url, null, "GET");
          this.userTable(result);
        }
      }
      else if($("#selectSearch").val() == "sex" && text != ""){
        var url = "/factrl/searchBySex?sex=" + text;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
      else if($("#selectSearch").val() == "saveBy" && text != ""){
        var url = "/factrl/searchBySaveBy?saveBy=" + text;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
    });

    $("#searchDate").on("change keyup", () => {
      var text = $("#searchDate").val() as string;
      if (text == "") {
        this.showAllUser();
      }
      else if($("#selectSearch").val() == "birthday" && text != ""){
        var array = text.split("-");
        array.reverse()
        var birthday = array.join("-");
        var url = "/factrl/searchByBirthday?birthday=" + birthday;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
      else if($("#selectSearch").val() == "dateSave" && text != ""){
        var array = text.split("-");
        array.reverse()
        var date = array.join("-");
        var url = "/factrl/searchByDateSave?dateSave=" + date;
        result = this.callAjaxService(url, null, "GET");
        this.userTable(result);
      }
    });
  }

  callAjaxService(uri: any, json: any, type: any):any{
    uri = "http://localhost:8080" + uri;
    
    var result;
    $.ajax({
        url: uri,
        type: type,
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify(json),
        async: false,
        success: function (data) {
          result = data;
        },
        error: function (jqXHR, status, error) {
          console.error(error);
        }
    });
    
    return result;
  }

  userTable(result: any) {
	  var table = $("#userTable").DataTable({
      destroy: true,
      searching: false,
      paging: true,
      pagingType: 'full_numbers',
      autoWidth: false,
      responsive: true,
      data: result,
      columnDefs: [{"className": "dt-center", "targets": "_all"}],
      columns: [
        {data: "number", defaultContent : "", width : "5%",},
        {data: "id", width : "10%",},
        {data: "name", defaultContent : "",
          render : function(data: any, type: any, row: { firstName: string; lastName: string; }, meta: any) {
            return row.firstName + " " + row.lastName;
          },
        },
        {data: "birthday", width : "10%",
          render : (data: any, type: any, row: { birthday: string; }, meta: any) => {
            var birthday = this.dateYMD_To_DMY(row.birthday);
            return birthday;
          },
        },
        {data: "age", width : "5%",},
        {data: "sex", width : "5%",},
        {data: "dateSave", width : "10%",
          render : (data: any, type: any, row: { dateSave: string; }, meta: any) => {
            var today = this.dateYMD_To_DMY(row.dateSave);
            return today;
          },
        },
        {data: "saveBy", width : "15%",},
        {
          width : "15%", defaultContent : "",
          render : (data: any, type: any, row: any, meta: any) => {
            return `<button type="button" class="btn btn-blue editBtn" style="margin-right: 5px;" id="editBtn">Edit</button><button type="button" class="btn btn-danger deleteBtn" >Delete</button>`
          },
        },
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.editBtn', row).off('click');
        $('.editBtn', row).on('click', () => {
          this.getIdOnClick(data);
          this.setMode("edit");
        })
    
        $('.deleteBtn', row).off('click');
        $('.deleteBtn', row).on('click', () => {
          this.getIdOnClick(data);
          this.delUser();
        })
        return row;
      },
      initComplete: (settings: any, json: any) => {
        var table = $("#userTable").DataTable();
        table.on("order.dt search.dt", function () {
              let i = 1;
              table.cells(null, 0, { search: "applied", order: "applied" }).every(function (cell) {
                  this.data(i++);
              });
          }).draw();
      }
    });
  }


}

