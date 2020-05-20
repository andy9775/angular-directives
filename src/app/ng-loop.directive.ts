import {
  Directive,
  ViewContainerRef,
  TemplateRef,
  OnChanges,
  OnInit,
  Input,
  HostBinding,
} from '@angular/core';

@Directive({
  selector: '[appNgLoop]',
})
export class NgLoopDirective implements OnChanges, OnInit {
  isActive = true;
  /* when using `let nr of numbers` we get:
    <ng-template appNgLoop #nr [appNgLoopOf]="numbers">
      <div>
        {{ nr }} - Foo
      </div>
    </ng-template>

    which binds the numbers array to the ...Of variable in this direvtive
    automatically. Hence the ...Of naming convention
  */

  @Input() appNgLoopOf: Array<any>;

  constructor(
    /*
      ViewContainerRef allows one or more views to be attached and used
      when creating views programatically
     */
    private container: ViewContainerRef,
    /*
      A reference to the element that this directive is being applied to.
      In this case, this allows us to repeate (copy) the specified template

      This is provided by dependency injection. However, if we use `appNgLoop`
      as an attribute it throws an error. `*appNgLoop` specifies that we want a
      reference to the current element.
    */
    private template: TemplateRef<any>
  ) {}

  ngOnChanges(): void {
    this.container.clear(); // if we don't clear, the views add up
    for (const input of this.appNgLoopOf) {
      this.container.createEmbeddedView(
        this.template,
        // context available to the view
        {
          $implicit: input,
          // automatic variable provded
          index: this.appNgLoopOf.indexOf(input),
        }
      );
    }
  }

  ngOnInit(): void {
    // the views created here plus those in ngOnChanges are combined
    //
    // this.container.createEmbeddedView(this.template);
    //
    // create 10 duplicate elements
    // for (let i = 0; i < 10; i++) {
    //   // adds the injected template (the HTML element with the *appNgLoop
    //   // attribute) inside the container.
    //   this.container.createEmbeddedView(this.template);
    // }
  }
}
