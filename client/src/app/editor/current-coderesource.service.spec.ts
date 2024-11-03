import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ApolloTestingModule } from "apollo-angular/testing";

import { TestBed } from "@angular/core/testing";

import {
  FullBlockLanguageGQL,
  FullGrammarGQL,
  FullProjectGQL,
} from "src/generated/graphql";
import { LanguageService } from "../shared/language.service";
import { NodeDescription, ServerApiService } from "../shared";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Overlay } from "@angular/cdk/overlay";

import { ProjectService } from "./project.service";
import { ResourceReferencesService } from "../shared/resource-references.service";
import { CurrentCodeResourceService } from "./current-coderesource.service";
import { FixedSidebarBlock } from "../shared/block";
import {
  specBuildBlockLanguageDescription,
  specLoadProject,
  specProvideBlockLanguageResponse,
  specProvideGrammarResponse,
} from "./spec-util";
import { GRAMMAR_SQL_DESCRIPTION } from "../shared/syntaxtree/grammar.spec.sql";
import { first } from "rxjs/operators";

describe(`CurrentCodersourceService`, () => {
  async function instantiate(
    ast: NodeDescription
  ): Promise<CurrentCodeResourceService> {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApolloTestingModule],
      providers: [
        FullProjectGQL,
        LanguageService,
        ServerApiService,
        ProjectService,
        FullGrammarGQL,
        MatSnackBar,
        Overlay,
        ResourceReferencesService,
        FullBlockLanguageGQL,
        ResourceReferencesService,
        CurrentCodeResourceService,
      ],
      declarations: [],
    });

    const projectService = TestBed.inject(ProjectService);
    const currentCodeResourceService = TestBed.inject(
      CurrentCodeResourceService
    );

    const blockLanguageDescription = specBuildBlockLanguageDescription({
      id: "1",
      grammarId: GRAMMAR_SQL_DESCRIPTION.id,
    });
    const grammarDescription = {
      ...GRAMMAR_SQL_DESCRIPTION,
      createdAt: "",
      updatedAt: "",
      visualizes: [],
      includes: [],
      blockLanguages: [{ id: "1", name: "Test Block Language" }],
      generatedFromId: null,
      slug: "sql",
    };
    await specLoadProject(projectService, {
      codeResources: [
        {
          blockLanguageId: "1",
          id: "2",
          name: "test Code",
          programmingLanguageId: "sql",

          ast: ast,
        },
      ],
      grammars: [grammarDescription],
      blockLanguages: [blockLanguageDescription],
    });
    specProvideBlockLanguageResponse(blockLanguageDescription);
    specProvideGrammarResponse(grammarDescription);

    const cr = projectService.cachedProject.getCodeResourceById("2");
    currentCodeResourceService._changeCurrentResource(cr);
    const v = await currentCodeResourceService.validator$
      .pipe(first())
      .toPromise();
    expect(v).toBeDefined();
    return currentCodeResourceService;
  }
  it(`can be instantiated`, async () => {
    const s = await instantiate({
      language: "sql",
      name: "querySelect",
    });
    expect(s).toBeDefined();
    expect(s.peekResource).toBeDefined();
    expect(await s.resourceBlockLanguageId.pipe(first()).toPromise()).toEqual(
      "1"
    );
    expect(await s.blockLanguage$.pipe(first()).toPromise()).toBeDefined();
    expect(s.peekSyntaxtree).toBeDefined();
  });

  it(`can set the hole location`, async () => {
    const s = await instantiate({
      language: "sql",
      name: "querySelect",
    });

    s.setCurrentHoleLocation([]);
    expect(await s.currentHoleLocation$.pipe(first()).toPromise()).toEqual([]);
  });

  it(`can locate the root node`, async () => {
    const s = await instantiate({
      language: "sql",
      name: "querySelect",
    });

    console.log(s.peekSyntaxtree.toModel());

    expect(await s.peekSyntaxtree.locateOrUndefined([])).toBe(
      s.peekSyntaxtree.rootNode
    );
  });

  it(`shows only Blocks with A`, async () => {
    const s = await instantiate({
      language: "sql",
      name: "querySelect",
    });

    const block: FixedSidebarBlock = new FixedSidebarBlock({
      displayName: "ANY",
      defaultNode: {
        name: "*",
        language: "sql",
      },
    });

    const result = await s.currentHoleMatchesBlock(block);
    expect(result).toBeTrue();
  });

  it(`does not show Blocks without A`, async () => {
    const s = await instantiate({
      language: "sql",
      name: "querySelect",
    });

    const block: FixedSidebarBlock = new FixedSidebarBlock({
      displayName: "FROM",
      defaultNode: {
        name: "*",
        language: "sql",
      },
    });

    const result = await s.currentHoleMatchesBlock(block);
    expect(result).toBeFalse();
  });

  describe(`sql: query select without FROM and SELECT`, () => {
    const treeDesc = {
      name: "querySelect",
      language: "sql",
      children: {
        from: [
          {
            name: "from",
            language: "sql",
          },
        ],
        where: [],
        select: [
          {
            name: "select",
            language: "sql",
          },
        ],
        groupBy: [],
      },
    };

    it(`fill FROM`, async () => {
      const s = await instantiate(treeDesc);

      const block: NodeDescription = {
        name: "starOperator",
        language: "sql",
      };
      s.setCurrentHoleLocation([
        ["select", 0],
        ["columns", 0],
      ]);
      expect(await s.peekSyntaxtree.locate([])).toBe(s.peekSyntaxtree.rootNode);
      expect(await s.peekSyntaxtree.locate([["select", 0]])).toBe(
        s.peekSyntaxtree.rootNode.children["select"][0]
      );

      const result = await s.currentHoleMatchesBlock(block);
      expect(result).toBeTrue();
    });
  });
});
