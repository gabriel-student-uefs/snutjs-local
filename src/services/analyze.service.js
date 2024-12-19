import helpers from "../common/helpers/index.js";
import path from "node:path";
import { detectors } from "../common/detectors/index.js";
import astService from "./ast.service.js";

class AnalyzeService {
  async handleAnalyze(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
      await helpers.downloadRepository(repoUrl, repoFolder);
      const testFiles = await helpers.findTestFiles(directory);
      const astFiles = testFiles.map((tf) => {
        const testAst = astService.parseFileToAst(tf);
        const testInfo = astService.getTestInfo(testAst);
        return detectors.map((detector) => {
          return {
            file: helpers.getPathAfterPublic(tf),
            type: detector.name.replace("detect", ""),
            smells: detector(testAst),
            info: testInfo,
          };
        });
      });
      await helpers.deleteDownloadRepositories(directory);
      return astFiles.flat();
    } catch (error) {
      await helpers.deleteDownloadRepositories(directory);
      console.error("Error when we tried to handle analyze", error);
      throw error;
    }
  }

  async handleAnalyzeLocal() {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./src/project");
    try {
      const testFiles = await helpers.findTestFiles(directory)
      const astFiles = testFiles.map((tf) => {
        const testAst = astService.parseFileToAst(tf);
        const testInfo = astService.getTestInfo(testAst);
        return detectors.map((detector) => {
          const relativeFilePath = path.relative(directory, tf);
          const result ={
            file: relativeFilePath,
            type: detector.name.replace("detect", ""),
            smells: detector(testAst),
            itCount: testInfo.itCount,
            describeCount: testInfo.describeCount,
          };
          return result;
        });
      });
      return astFiles.flat();
    } catch (error) {
      console.error("Error when we tried to handle analyze local", error);
      throw error;
    }
  }

  async handleAnalyzeToCSV(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
      await helpers.downloadRepository(repoUrl, repoFolder);
      const testFiles = await helpers.findTestFiles(directory);
      const astFiles = testFiles.map((tf) => {
        const testAst = astService.parseFileToAst(tf);
        const testInfo = astService.getTestInfo(testAst);
        return detectors.map((detector) => {
          return {
            file: helpers.getPathAfterPublic(tf),
            type: detector.name.replace("detect", ""),
            smells: detector(testAst),
            itCount: testInfo.itCount,
            describeCount: testInfo.describeCount,
          };
        });
      });
      await helpers.deleteDownloadRepositories(directory);
      return astFiles.flat();
    } catch (error) {
      await helpers.deleteDownloadRepositories(directory);
      console.error("Error when we tried to handle analyze to csv", error);
      throw error;
    }
  }

  async countTestFiles(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
      await helpers.downloadRepository(repoUrl, repoFolder);
      const testFiles = await helpers.findTestFiles(directory);
      await helpers.deleteDownloadRepositories(directory);
      return testFiles.length;
    } catch (error) {
      await helpers.deleteDownloadRepositories(directory);
      console.error("Error when we tried to count test files", error);
      throw error;
    }
  }
}

const analyzeService = new AnalyzeService();
export default analyzeService;
