/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit} from '@angular/core';
import {map, startWith} from 'rxjs/operators';
import {Site} from '../../../../models/site';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {ISubscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {SearchInputUtility} from '../../../../utilities/search-input.utility';
import {SiteService} from '../../../../services/site/site.service';

@Component({
  selector: 'app-site-view',
  templateUrl: './site-view.component.html',
  styleUrls: ['./site-view.component.scss']
})
export class SiteViewComponent implements OnInit {
  public sites: Site[];
  public searchInput: string | number;
  public filter: FormControl = new FormControl('');
  public displayResults = false;
  public sites$: Observable<Site[]>;
  public getSiteSubscription: ISubscription;

  public constructor(
    private _siteService: SiteService,
    private _router: Router,
    private _searchInputUtility: SearchInputUtility
  ) {}

  public ngOnInit(): void {
    this.retrieveSearchInput();
    this.getSites();
    this.insertSearchValue();
  }

  public insertSearchValue(): void {
    this.sites$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(() => this.search(this.filter.value))
    );
  }

  public getSites(): void {
    this._siteService.getSites().subscribe((getSiteResult) => {
      this.displayResults = true;

      this.sites = getSiteResult;
    });
  }

  public search(text: string | number): Site[] {
    if (text) {
      const term: string = text.toString().toLowerCase();

      return this.sites.filter((site) => {
        if (site.objectAggregationMeteringPoint.toLowerCase().includes(term)) {
          this.clearSelection();

          return site;
        }
      });
    }

    return this.sites;
  }

  private clearSelection(): void {
    for (const site of this.sites) {
      site.selected = false;
    }
  }

  public selectSite(site: Site): void {
    if (site.selected) {
      site.selected = false;

      return;
    }

    site.selected = !site.selected;
  }

  public redirectToDashboard(): void {
    this._router.navigate(['./dashboard']);
  }

  public redirectToHistory(): void {
    this._router.navigate(['./historique']);
  }

  private retrieveSearchInput(): void {
    this.getSiteSubscription = this._searchInputUtility.newSearchInput.subscribe(
      (searchInput: string | number) => {
        if (Object.keys(searchInput).length !== 0) {
          this.searchInput = searchInput;
        }
      }
    );
  }
}
