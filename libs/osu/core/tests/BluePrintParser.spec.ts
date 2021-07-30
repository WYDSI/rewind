import { assert, expect } from "chai";
import { describe } from "mocha";
import { parseOsuHitObjectSetting, PathControlPoint, PathType } from "../src";
import { HitCircleSettings, HitObjectSettingsType, SliderSettings } from "../src/blueprint/HitObjectSettings";
import { osuMapPath, parseBlueprintFromFS, TEST_MAPS } from "./util";
import { Position } from "osu-math";

describe("Test *.osu blue print parsing", function () {
  describe("Map: ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu", function () {
    const bm = parseBlueprintFromFS(osuMapPath("ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu"));
    // console.log(bm);
    it("should parse the meta data correctly", function () {
      assert.ownInclude(bm.blueprintInfo.metadata, {
        artist: "ZUTOMAYO",
        artistUnicode: "ずっと真夜中でいいのに。",
        title: "Kan Saete Kuyashiiwa",
        titleUnicode: "勘冴えて悔しいわ",
        tags: "zutto mayonaka de ii no ni. acane sukinathan scubdomino luscent 404_aimnotfound",
        audioFile: "audio.mp3",
        // previewTime: 0
      });
    });
    it("should parse the beatmap version correctly", function () {
      assert.equal(bm.blueprintInfo.beatmapVersion, 14);
    });
    it("should read some hit objects", function () {
      assert.isNotEmpty(bm.hitObjectSettings, "No hit objects inserted");
    });
    it("should parse blueprint default difficulty correctly", function () {
      // TODO: ??? Why using `bm` uses another one ??? seems like caching issue.
      const xd = parseBlueprintFromFS(osuMapPath("ZUTOMAYO - Kan Saete Kuyashiiwa (Nathan) [geragera].osu"));
      console.log(xd.defaultDifficulty);
      assert.ownInclude(xd.defaultDifficulty, {
        drainRate: 5,
        circleSize: 4,
        overallDifficulty: 9,
        approachRate: 9.6,
        sliderMultiplier: 1.8,
        sliderTickRate: 1,
      });
    });

    it("should have the timing control points ordered non-decreasingly by start time", function () {
      const { timingPoints } = bm.controlPointInfo;
      for (let i = 0; i + 1 < timingPoints.length; i++) {
        const a = timingPoints.get(i);
        const b = timingPoints.get(i + 1);
        assert.isTrue(a.time <= b.time, `Not ordered properly at i=${i}: ${a.time} <= ${b.time}`);
      }
    });
  });
});

function mapToOffsets(controlPoints: PathControlPoint[]): Position[] {
  return controlPoints.map((p) => p.offset);
}

describe("HitObjectSettingsParsing", function () {
  describe("HitCircle - Simple", function () {
    const settings = parseOsuHitObjectSetting("256,192,11000,21,2") as HitCircleSettings;
    it("should parse correctly", function () {
      expect(settings.type).to.equal(HitObjectSettingsType.HIT_CIRCLE);
      expect(settings.position.x).to.equal(256);
      expect(settings.position.y).to.equal(192);
      expect(settings.time).to.equal(11000);
      expect(settings.newCombo).to.be.true;
      expect(settings.comboSkip).to.be.equal(1);
      // TODO: Sample
    });
  });

  describe("Slider, Bezier, Simple", function () {
    it("should parse correctly", function () {
      const settings = parseOsuHitObjectSetting(
        "100,101,12600,6,1,B|200:200|250:200|250:200|300:150,2,310.123,2|1|2,0:0|0:0|0:2,0:0:0:0:"
      ) as SliderSettings;
      expect(settings.type).to.equal(HitObjectSettingsType.SLIDER);
      expect(settings.position.x).to.equal(100);
      expect(settings.position.y).to.equal(101);
      expect(settings.time).to.equal(12600);
      expect(settings.newCombo).to.be.true;
      expect(settings.comboSkip).to.be.equal(0);
      expect(mapToOffsets(settings.pathPoints)).to.be.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 99 },
        { x: 150, y: 99 },
        { x: 200, y: 49 },
      ]);
      console.log(settings.pathPoints);
      expect(settings.pathPoints[0].type).to.be.equal(PathType.Bezier);
      // expect(settings.pathPoints[1].type).to.be.undefined;
      // expect(settings.pathPoints[2].type).to.be.undefined; // Bezier ???
      // expect(settings.pathPoints[3].type).to.be.undefined;
      // TODO: Sample
    });
  });
  describe("Slider, Centripetal catmull-rom", function () {
    it("should parse correctly", function () {
      const settings = parseOsuHitObjectSetting(
        "100,-101,12600,6,1,C|200:200|300:412,2,310.123,2|1|2,0:0|0:0|0:2,0:0:0:0:"
      ) as SliderSettings;
      expect(settings.type).to.equal(HitObjectSettingsType.SLIDER);
      expect(settings.position.x).to.equal(100);
      expect(settings.position.y).to.equal(-101);
      expect(settings.time).to.equal(12600);
      expect(settings.newCombo).to.be.true;
      expect(settings.comboSkip).to.be.equal(0);
      // expect(settings.pathPoints).to.be.deep.equal([{x: 200, y: 200}, {x: 300, y: 412}]);
      // TODO: Sample
    });
  });
});

describe("Parsing one slider", function () {
  it("should parse the one slider correctly", function () {
    const bluePrint = parseBlueprintFromFS(osuMapPath("Perfume - Daijobanai (eiri-) [Slider 1].osu"));
    expect(bluePrint.hitObjectSettings.length).to.be.eq(1);
    console.log(bluePrint.hitObjectSettings[0]);
  });
});

describe("Parsing one slider with repeat", function () {
  it("should parse the one slider with repeat correctly", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.SLIDER_WITH_ONE_REPEAT);
    expect(bluePrint.hitObjectSettings.length).to.be.eq(1);
    const sliderSetting = bluePrint.hitObjectSettings[0] as SliderSettings;
    expect(sliderSetting.repeatCount).to.be.equal(1);
  });
});

//
describe("Parsing kick slider", function () {
  const bluePrint = parseBlueprintFromFS(TEST_MAPS.SHORT_KICK_SLIDER);
  // TODO: Make a better version of this test because previously there was no flush pending points
  it("should parse the control points correctly", function () {
    console.log(bluePrint.controlPointInfo.timingPoints);
    expect(bluePrint.controlPointInfo.timingPoints.length).to.be.eq(1);
  });
});
