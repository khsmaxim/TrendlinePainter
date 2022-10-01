import { Component, Input, Output, OnInit, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn
} from '@angular/forms';
import { IAxies } from 'src/app/models/Axies';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-axis-form',
  templateUrl: './axis-form.component.html',
  styleUrls: ['./axis-form.component.scss']
})
export class AxisFormComponent implements OnInit {
  private _iaxis!: IAxies;
  @Input()
  set iaxies(value: IAxies) {
    this.iaxiesChange.emit(value);
    this._iaxis = value;
  }
  get iaxies() {
    return this._iaxis;
  }
  @Output() iaxiesChange: EventEmitter<IAxies> = new EventEmitter<IAxies>();

  @Output() onReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() onApply: EventEmitter<IAxies> = new EventEmitter<IAxies>();

  axisForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.axisForm.controls;
  }

  ngOnInit(): void {
    this.axisForm = this.formBuilder.group({
      timeAxisWidth: [this.iaxies.time.width, [Validators.required]],
      timeAxisCell: [this.iaxies.time.cell.size, [Validators.required]],
      priceAxisHeight: [this.iaxies.price.height, [Validators.required]],
      priceAxisCell: [this.iaxies.price.cell.size, [Validators.required]],
      candleWidth: [this.iaxies.time.candle.size, [Validators.required]],
      candleInterval: [this.iaxies.time.candle.interval, [Validators.required]]
    });

    this.axisForm.valueChanges.subscribe(change => {
      this.iaxies = ObjectUtil.mergeDeep(this.iaxies, {
        time: {
          width: change['timeAxisWidth'],
          cell: {
            size: change['timeAxisCell']
          },
          candle: {
            size: change['candleWidth'],
            interval: change['candleInterval']
          }
        },
        price: {
          height: change['priceAxisHeight'],
          cell: {
            size: change['priceAxisCell']
          }
        }});
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('iaxies') && this.axisForm) {
      this.axisForm.controls['timeAxisWidth'].patchValue(this.iaxies.time.width, {onlySelf: true});
      this.axisForm.controls['timeAxisCell'].patchValue(this.iaxies.time.cell.size, {onlySelf: true});
      this.axisForm.controls['priceAxisHeight'].patchValue(this.iaxies.price.height, {onlySelf: true});
      this.axisForm.controls['priceAxisCell'].patchValue(this.iaxies.price.cell.size, {onlySelf: true});
      this.axisForm.controls['candleWidth'].patchValue(this.iaxies.time.candle.size, {onlySelf: true});
      this.axisForm.controls['candleInterval'].patchValue(this.iaxies.time.candle.interval, {onlySelf: true});
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.axisForm.invalid) {
      return;
    }
    this.onApply.emit(this._iaxis);
    // console.log(JSON.stringify(this.form.value, null, 2));
  }

  reset(): void {
    this.onReset.emit();
  }
}
