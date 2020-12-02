/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, Input, OnInit} from '@angular/core';
import {map, startWith} from 'rxjs/operators';
import {Site} from '../../../../models/site';
import {Eda} from '../../../../models/eda';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {ISubscription} from 'rxjs/Subscription';
import {EdaService} from '../../../../services/eda/eda-service';
import {Router} from '@angular/router';
import {SearchInputUtility} from '../../../../utilities/search-input.utility';
import {SessionService} from '../../../../services/session/session-service';

@Component({
  selector: 'app-eda-view',
  templateUrl: './eda-view.component.html',
  styleUrls: ['./eda-view.component.scss']
})
export class EdaViewComponent implements OnInit {
  @Input()
  public organizationType: string;

  @Input()
  public company: string;

  public EDAs: Eda[] = [];
  public site: Site;
  public edas$: Observable<Eda[]>;
  public filter: FormControl = new FormControl('');
  public displayResults = false;
  public searchInput: string | number;
  public getEdaSubscription: ISubscription;

  public constructor(
    private _edaService: EdaService,
    private _router: Router,
    private _searchInputUtility: SearchInputUtility,
    private _sessionService: SessionService
  ) {}

  public ngOnInit(): void {
    this.retrieveSearchInput();
    this.getEDAs();
    this.insertSearchValue();
  }

  public insertSearchValue(): void {
    this.edas$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(() => this.search(this.filter.value))
    );
  }

  public getEDAs(): void {
    this._edaService.getEDAs().subscribe((response) => {
      for (const eda of response) {
        this._edaService
          .getSitesByedaRegisteredResourceId(eda.edaRegisteredResourceId)
          .subscribe((siteSearchResponse) => {
            const sites: Site[] = siteSearchResponse;

            for (let site of sites) {
              this._edaService
                .getEDPBySiteID(site.siteId)
                .subscribe((result) => {
                  site.edp = result[0];
                  this.displayResults = true;

                  if (!this.shouldedpRegisteredResourceMridBeDisplayed()) {
                    site.edp.edpRegisteredResourceMrid = 'NO_NAME';
                  }
                });
            }

            eda.sites = sites;
            this.EDAs.push(eda);
            if (this.isOrganizationType('bsp')) {
              this.filterEDAsByBSPid(this.EDAs);
            }
          });
      }
    });
  }

  public search(text: string | number): Eda[] {
    if (text) {
      const term: string = text.toString().toLowerCase();

      return this.EDAs.filter((eda) => {
        let siteMatch = eda.sites.find((site) =>
          site.objectAggregationMeteringPoint.toLowerCase().includes(term)
        );

        if (eda.edaRegisteredResourceName.toLowerCase().includes(term)) {
          this.clearSelection();

          return eda;
        }

        if (siteMatch !== undefined) {
          this.clearSelection();
          this.site = siteMatch;
          this.site.selected = true;
          eda.selected = true;

          return eda;
        }
      });
    }

    return this.EDAs;
  }

  private clearSelection(): void {
    for (const eda of this.EDAs) {
      eda.selected = false;
    }
    if (this.site) {
      this.site.selected = false;
    }
  }

  public selectEDA(eda: Eda): void {
    if (eda.selected) {
      eda.selected = false;

      return;
    } else {
      for (const site of eda.sites) {
        site.selected = false;
      }
    }

    for (const edaValue of this.EDAs) {
      edaValue.selected = false;
    }

    this.site = null;
    eda.selected = !eda.selected;
  }

  public selectSite(site: Site, eda: Eda): void {
    this.site = site;
    this.site.selected = false;

    if (this.site.selected) {
      this.site.selected = false;

      return;
    }

    for (const siteValue of eda.sites) {
      siteValue.selected = false;
    }

    this.site.selected = !this.site.selected;
  }

  public shouldedpRegisteredResourceMridBeDisplayed(): boolean {
    return this.isOrganizationType('bsp');
  }

  public isOrganizationType(organizationType: string): boolean {
    return organizationType === this.organizationType;
  }

  public redirectToDashboard(): void {
    this._router.navigate(['./dashboard']);
  }

  public redirectToHistory(): void {
    this._router.navigate(['./historique']);
  }

  private filterEDAsByBSPid(edas: Eda[]): void {
    this.EDAs = edas.filter((eda: Eda) => {
      return eda.a46Name === this.company;
    });
  }

  private retrieveSearchInput(): void {
    this.getEdaSubscription = this._searchInputUtility.newSearchInput.subscribe(
      (searchInput: string | number) => {
        if (Object.keys(searchInput).length !== 0) {
          this.searchInput = searchInput;
        }
      }
    );
  }
}
