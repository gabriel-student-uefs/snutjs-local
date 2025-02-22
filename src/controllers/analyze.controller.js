import { detectors } from "../common/detectors/index.js";
import helpers from "../common/helpers/index.js";
import analyzeService from "../services/analyze.service.js";
import { Parser } from "@json2csv/plainjs";
const csvParser = new Parser({});

const splitFilteredResults = (filteredResult) => {
  let result = [];

  filteredResult.forEach(item => {
    item.smells.forEach(smell => {
      result.push({
        file: item.file,
        type: item.type,
        smells: [smell],
        itCount: item.itCount,
        describeCount: item.describeCount
      });
    });
  });

  return result;
}

class AnalyzeController {
  async fetch(request, reply) {
    const data = detectors.map((detector) =>
      detector.name.replace("detect", "")
    );
    reply.send({ data });
  }

  async store(request, reply) {
    const { repository, hasTestSmell } = request.body;
    if (!repository) {
      return reply
        .status(403)
        .send({ message: "You should provide the repository url" });
    }
    const isAValidRepository = helpers.isValidRepositoryUrl(repository);

    if (!isAValidRepository) {
      return reply
        .status(422)
        .send({ message: "You should provide a valid repository url" });
    }

    try {
      const result = await analyzeService.handleAnalyze(repository);
      const filteredResult = hasTestSmell
        ? result.filter((re) => !!re.smells && re.smells.length > 0)
        : result;

      reply.send(filteredResult);
    } catch (error) {
      console.error("error", error);
      reply
        .status(500)
        .send({ message: "Ocorreu um erro ao tentar analisar o repositório" });
    }
  }

  async getCSV(request, reply) {
    const { repository } = request.body;
    if (!repository) {
      return reply
        .status(403)
        .send({ message: "You should provide the repository url" });
    }
    const isAValidRepository = helpers.isValidRepositoryUrl(repository);

    if (!isAValidRepository) {
      return reply
        .status(422)
        .send({ message: "You should provide a valid repository url" });
    }

    try {
      const result = await analyzeService.handleAnalyzeToCSV(repository);
      const filteredResult = result.filter(
        (re) => !!re.smells && re.smells.length > 0
      );

      const csv = csvParser.parse(filteredResult);
      reply.header(
        "Content-Type",
        "text/csv",
        "Content-Disposition",
        "attachment; filename=data.csv"
      );
      reply.send(csv);
    } catch (error) {
      console.error("error", error);
      reply
        .status(500)
        .send({ message: "Ocorreu um erro ao tentar analisar o repositório" });
    }
  }

  async getCSVLocal(request, reply) {
    try {
      const result = await analyzeService.handleAnalyzeLocal();
      const filteredResult = result.filter(
        (re) => !!re.smells && re.smells.length > 0
      );

      const output = splitFilteredResults(filteredResult);

      const csv = csvParser.parse(output);
      reply.header(
        "Content-Type",
        "text/csv",
        "Content-Disposition",
        "attachment; filename=data.csv"
      );
      reply.send(csv);
    } catch (error) {
      console.error("error", error);
      reply
        .status(500)
        .send({ message: "Ocorreu um erro ao tentar analisar os arquivos locais" });
    }
  }

  async countTestFiles(request, reply) {
    const { repository } = request.body;
    if (!repository) {
      return reply
        .status(403)
        .send({ message: "You should provide the repository url" });
    }
    const isAValidRepository = helpers.isValidRepositoryUrl(repository);

    if (!isAValidRepository) {
      return reply
        .status(422)
        .send({ message: "You should provide a valid repository url" });
    }

    try {
      const result = await analyzeService.countTestFiles(repository);
      reply.send(result);
    } catch (error) {
      console.error("Error when we tried to count test files", error);
      reply.status(500).send({
        message:
          "Ocorreu um erro ao tentar contar os arquivos de teste do repositório",
      });
    }
  }
}

const analyzeController = new AnalyzeController();

export default analyzeController;
