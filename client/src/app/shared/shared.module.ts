/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {NgModule} from '@angular/core';
import {SpinnerComponent} from './spinner/spinner.component';

@NgModule({
  declarations: [SpinnerComponent],
  exports: [SpinnerComponent]
})
export class SharedModule {}
