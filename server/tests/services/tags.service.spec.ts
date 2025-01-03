import Tags from '../../models/tags.model';
import QuestionModel from '../../models/questions.model';
import { addTag, processTags, getTagCountMap } from '../../services/tag.service';
import { QUESTIONS, tag1, tag2, tag3 } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Tag model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });
  describe('addTag', () => {
    test('addTag return tag if the tag already exists', async () => {
      mockingoose(Tags).toReturn(tag1, 'findOne');

      const result = await addTag({ name: tag1.name, description: tag1.description });

      expect(result?._id).toEqual(tag1._id);
    });

    test('addTag return tag id of new tag if does not exist in database', async () => {
      mockingoose(Tags).toReturn(null, 'findOne');

      const result = await addTag({ name: tag2.name, description: tag2.description });

      expect(result).toBeDefined();
    });

    test('addTag returns null if findOne throws an error', async () => {
      mockingoose(Tags).toReturn(new Error('error'), 'findOne');

      const result = await addTag({ name: tag1.name, description: tag1.description });

      expect(result).toBeNull();
    });

    test('addTag returns null if save throws an error', async () => {
      mockingoose(Tags).toReturn(null, 'findOne');
      mockingoose(Tags).toReturn(new Error('error'), 'save');

      const result = await addTag({ name: tag2.name, description: tag2.description });

      expect(result).toBeNull();
    });
  });

  describe('processTags', () => {
    test('processTags should return the tags of tag names in the collection', async () => {
      mockingoose(Tags).toReturn(tag1, 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(2);
      expect(result[0]._id).toEqual(tag1._id);
      expect(result[1]._id).toEqual(tag1._id);
    });

    test('processTags should return a list of new tags ids if they do not exist in the collection', async () => {
      mockingoose(Tags).toReturn(null, 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(2);
    });

    test('processTags should return empty list if an error is thrown when finding tags', async () => {
      mockingoose(Tags).toReturn(Error('Dummy error'), 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(0);
    });

    test('processTags should return empty list if an error is thrown when saving tags', async () => {
      mockingoose(Tags).toReturn(null, 'findOne');
      mockingoose(Tags).toReturn(Error('Dummy error'), 'save');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(0);
    });
  });

  describe('getTagCountMap', () => {
    test('getTagCountMap should return a map of tag names and their counts', async () => {
      mockingoose(Tags).toReturn([tag1, tag2, tag3], 'find');
      mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
      QuestionModel.schema.path('tags', Object);

      const result = (await getTagCountMap()) as Map<string, number>;

      expect(result.size).toEqual(3);
      expect(result.get('react')).toEqual(1);
      expect(result.get('javascript')).toEqual(2);
      expect(result.get('android')).toEqual(1);
    });

    test('getTagCountMap should return an object with error if an error is thrown', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

      const result = await getTagCountMap();

      if (result && 'error' in result) {
        expect(true).toBeTruthy();
      } else {
        expect(false).toBeTruthy();
      }
    });

    test('getTagCountMap should return an object with error if an error is thrown when finding tags', async () => {
      mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
      mockingoose(Tags).toReturn(new Error('error'), 'find');

      const result = await getTagCountMap();

      if (result && 'error' in result) {
        expect(true).toBeTruthy();
      } else {
        expect(false).toBeTruthy();
      }
    });

    test('getTagCountMap should return null if Tags find returns null', async () => {
      mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
      mockingoose(Tags).toReturn(null, 'find');

      const result = await getTagCountMap();

      expect(result).toBeNull();
    });

    test('getTagCountMap should return default map if QuestionModel find returns null but not tag find', async () => {
      mockingoose(QuestionModel).toReturn(null, 'find');
      mockingoose(Tags).toReturn([tag1], 'find');

      const result = (await getTagCountMap()) as Map<string, number>;

      expect(result.get('react')).toBe(0);
    });

    test('getTagCountMap should return null if find returns []', async () => {
      mockingoose(QuestionModel).toReturn([], 'find');
      mockingoose(Tags).toReturn([], 'find');

      const result = await getTagCountMap();

      expect(result).toBeNull();
    });
  });
});