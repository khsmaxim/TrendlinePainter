import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAxies, Axies } from 'src/app/models/Axies';
import { DeleteConfirmModalComponent } from 'src/app/modals/delete-confirm-modal/delete-confirm-modal.component';
import { IBoorkmarks, Boorkmark } from 'src/app/models/Bookmark';
import { BoorkmarksService } from 'src/app/services/bookmark/bookmark.service';

@Component({
  selector: 'app-bookmarks-modal',
  templateUrl: './bookmarks-modal.component.html',
  styleUrls: ['./bookmarks-modal.component.scss']
})
export class BookmarksModalComponent implements OnInit {
  @Input() public currid!: string;

  constructor(
    private _bookmarksService: BoorkmarksService,
    private _modalService: NgbModal,
    private _activeModal: NgbActiveModal
  ) {
    _bookmarksService.read();
  }

  get data(): IBoorkmarks {
    return this._bookmarksService.data;
  }

  ngOnInit(): void {
  }

  choose(id: string) {
    this._activeModal.close({id: id, item: this._bookmarksService.data[id]});
  }

  delete(event: MouseEvent, id: string) {
    event.stopPropagation();
    const modalRef = this._modalService.open(DeleteConfirmModalComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'sm'
    }).result.then((result) => {
        this._bookmarksService.remove(id);
      }, (reason) => {});
  }

  cancel() {
    this._activeModal.dismiss({
      has: this._bookmarksService.has(this.currid)
    });
  }

  mb(mb: IAxies): Axies {
    return new Axies(mb);
  }

}
